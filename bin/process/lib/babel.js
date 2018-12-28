
var babel = require('babel-core');
var $require = null;  //web-master 内部使用的 require 方法。
var dest$md5 = {};


function log(file) {
    console.log('babel 转换'.bgCyan, file.cyan);
}


module.exports = {

    init: function (require) {
        $require = require;
    },

    /**
    * 对指定的 js 内容进行 babel 转码。
    * 返回转码后的内容。
    *   content: '',    //必选。 要转码的 js 内容。
    *   options = {     //可选。 用于生成文件头的注释。
    *       md5: '',    //可选。 要转码的 js 内容对应的 md5 值，如果不指定，则重新计算。
    *       file: '',   //可选。 源文件路径。
    *       list: [],   //可选。 多个源文件的列表。
    *   };
    */
    transform: function (content, options) {
        content = content || '';
        options = options || {};


        var defindJS = $require('defineJS');
        var $Date = defindJS.require('Date');
        var MD5 = $require('MD5');

        var md5 = options.md5 || MD5.get(content);
        var file = options.file || '(none)';
        var list = options.list;

        //生成的格式如：
        //* source file: 4 files:
        //*   ../htdocs/views/subject/Subject/API.js
        //*   ../htdocs/views/subject/Subject/Header.js
        //*   ../htdocs/views/subject/Subject/List.js
        //*   ../htdocs/views/subject/Subject.js
        if (list && list.length > 0) {
            file = list.length + ' files:';

            list = list.map(function (item) {
                return '*   ' + item;
            });

            file = [file, ...list].join('\r\n');
        }


        var lines = [
           '/*',
           '* babel time: ' + $Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
           '*',
           '* source md5: ' + md5,
           '*',
           '* source file: ' + file,
           '*/',
           '',
           '',
        ];


        var info = babel.transform(content, {
            'presets': [
                'es2015',
            ],
            'plugins': [],
            'compact': false,
        });

        content = info.code;


        var useStrict =
            content.startsWith("'use strict';") ||
            content.startsWith('"use strict";');

        if (useStrict) {
            lines = [
                ...lines,
                '//' + content.slice(0, 13) + ' //取消 babel 自动生成的严格模式。',
                content.slice(14),
            ];
        }

        content = lines.join('\r\n');

        return content;
    },

    /**
    * 对指定的 js 文件进行 babel 转码。
    * 如果指定输出的目标文件，则写入。
    * 返回转码后的内容。
    */
    transformFile: function (file, dest) {
        var File = $require('File');
        var MD5 = $require('MD5');
        var content = File.read(file);
        var md5 = MD5.get(content);

        if (dest && dest$md5[dest] == md5) {
            return;
        }

        log(file);

        content = module.exports.transform(content, {
            'file': file,
            'md5': md5,
        });

        if (dest) {
            dest$md5[dest] = md5;
            File.write(dest, content);
        }

        return content;
    },



    /**
    * 对 js 文件作 babel 转码，生成并返回相应的 `<script>` 标签 html 内容。
    * 该方法用于开发阶段，由 watch compat 调用。
    * 用于从 master 文件生成 html 文件后，对 html 文件内容进行后处理。
    *   opt = {
    *       htdocs: '',     //
    *       data: {         //
    *           
    *       },
    *   };
    */
    render: function (file, data, opt) {
        var File = $require('File');
        var Path = $require('Path');
        var Js = $require('Js');
        var MetaProps = $require('MetaProps');


        var htdocs = opt.htdocs;
        var dir = htdocs + opt.dir;
        var md5 = data.md5;     //js 文件所对应的 md5 值。


        var dest = Path.relative(htdocs, file); //如 `html/redirect/index.js`
        dest = dir + dest;  //如 `../htdocs/babel/html/redirect/index.js`

        var href = Path.relative(data.dir, dest);   //根据 html 页面所在的目录，计算出新的 href。
        var props = MetaProps.delete(data.props || {});


        //要 babel 的目标文件的 md5 跟输入的不一致，需要重新 babel。
        if (dest$md5[dest] != md5) {
            log(file);
            dest$md5[dest] = md5;

            var content = File.read(file);

            content = module.exports.transform(content, {
                'file': file,
                'md5': md5,
            });

            File.write(dest, content);
        }



        var html = '';


        //只有明确指定了内联，且为内部文件时，才能内联。
        if (data.inline && !data.external) {
            html = Js.inline({
                'file': dest,
                'comment': true,
                'props': data.props,
                'tabs': data.tabs,
            });
        }
        else {
            html = Js.mix({
                'href': href,
                'props': data.props,
                'tabs': data.tabs,
                'query': data.query,
            });
        }


        return html;
    },

    /**
    * 该方法用于构建阶段，由 build compat 调用。
    *   links: [],  // JsLinks 实例数组。
    */
    build: function (links) {

        var no$line = {}; //修改后的行号与内容。 
        var babel = module.exports;

        links.forEach(function (item) {
            var meta = item.meta;

            //该 script 标签只用于标准版，清空该行的 html。
            if (meta.type == 'normal') {
                no$line[item.no] = '';
                return;
            }

            //除非显式指定 `babel=false;`，否则都做 babel 转码。
            if (meta.babel == 'false') {
                return;
            }


            //针对 `babel=.;` 的情况，作 babel，且输出为原文件名。
            if (meta.babel == '.') {
                var file = item.file;
                babel.transformFile(file, file);
                return;
            }


            //其它情况，作 babel 转码，且输出带 `.babel.` 的文件。

            var ext = item.ext;                     //如 `.debug.js`。
            var href = item.href;                   //如 `f/polyfill/polyfill.debug.js`。

            var pos = 0 - ext.length;               //如 -9。
            var ext2 = '.babel' + ext;              //如 `.babel.debug.js`。
            var href2 = href.slice(0, pos) + ext2;  //如 `f/polyfill/polyfill.babel.debug.js`。

            var html = item.html;                   //如 `<script src="f/polyfill/polyfill.debug.js" data-meta="type=compat; babel=false;"></script>`。
            var html2 = html.replace(href, href2);  //如 `<script src="f/polyfill/polyfill.bable.debug.js" data-meta="type=compat; babel=false;"></script>`。

            var line = item.line;                   //如 `    <script src="f/polyfill/polyfill.debug.js" data-meta="type=compat; babel=false;"></script>`
            var line2 = line.replace(html, html2);  //如 `    <script src="f/polyfill/polyfill.bable.debug.js" data-meta="type=compat; babel=false;"></script>`

            var file = item.file;                   //如 `../htdocs/f/polyfill/polyfill.debug.js`
            var dest = file.slice(0, pos) + ext2;   //如 `../htdocs/f/polyfill/polyfill.babel.debug.js`。

            babel.transformFile(file, dest);

            no$line[item.no] = line2;

        });

        return no$line;

       
    },

};

