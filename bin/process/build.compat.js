/**
* 针对兼容模式的处理。
* 即命令行中使用了 `node build compat` 开头的的命令。
*/



var babel = require('./lib/babel.js');
var template = require('./lib/template.js');


module.exports = function (require, website, defaults) {
    babel.init(require);
    template.init(require);


    var JsLink = require('JsLink');
    var Lines = require('Lines');


    website.on('parse', {
        /**
        * 解析 master 页面时触发。
        * 如果返回新的内容，则以新的内容(包括空字符串)作为要解析的 master 内容。
        * 可以在此事件对 master 页面做转换处理，如删掉一些标签等。
        * 此处完成的功能：
        *   删除所有元数据 (data-meta) 属性里含有 `type="normal"` 的 `<script>` 标签。
        *   对符合条件的 js 文件做 babel 转码，改写 `<script>` 标签以引用到 babel 版本的文件。
        * 因为 build 阶段，会存在把 `.debug.js` 改写成 `.min.js` 的过程，
        * 所以此处直接在解析 master 页面时做 `<script>` 标签的替换会比较方便，
        * 如把 `.debug.js` 做了 babel 转换后替换成 `.babel.debug.js`，
        * 在后续就就可以按原来的流程自动地换成 `.babel.min.js` 而无需要做额外的处理。
        * 此处有点像代理的意思，直接修改源头(master 内容)。
        * 注意：
        *   但在开发阶段，不适合使用该事件做 js 文件的转换处理，
        *   是因为监控的 js 文件的必须开发者编辑的源文件。
        *   如开发的源文件为 `a.js`，如果在监控之前就做了转换处理为 `a.babel.js`，
        *   那么解析 master 页面后，监控到的将会是 `a.babel.js`，而开发者修改 `a.js` 后将不会触发变化。
        */
        'master': function (file, content, data) {
            var lines = Lines.split(content);

            var links = JsLink.parse(content, {
                'dir': data.dir,
            });

            var no$line = babel.build(links); //返回修改的行号与内容。

            Object.keys(no$line).forEach(function (no) {
                lines[no] = no$line[no];
            });

            content = Lines.join(lines);

            return content;
        },
    });

    /**
    * 编译包文件时触发。
    */
    website.on('package', 'compile', {
        /**
        * 对输出的 html 包作转换。
        */
        'html-block': function (content, data) {
            return template.transform(content, data.list);
        },

        /**
        * 对输出的 js 包作转换。
        */
        'js-block': function (content, data) {
            console.log('package: babel 转码合并后的内容'.bgCyan, 'md5:', data.md5.cyan);
            return babel.transform(content, data);
        },
    });


    website.on('build', {
        /**
        * 合并完成后、压缩之前，要对 js 内容进行转码(如 babel 转码)。
        * 如果返回新的内容，则以新的内容(包括空字符串)作为最终结果。
        */
        'js-block': function (content, data) {
            console.log('babel 转码合并后的内容'.bgCyan, 'md5:', data.md5.cyan);

            return babel.transform(content, data);
        },
    });



    website.on('render', {
        /**
        * 渲染 master 页面成 html 页面时触发。 
        * 可以在此事件对生成的 html 做进一步处理和转换等。 
        *   dest: '',   //输出的 html 页面地址。 如 `../htdocs/index.html`。
        *   html: '',   //默认方式渲染生成的 html 内容。
        *   data: {},   //其它更多的信息。
        * 如果返回新的 html(包括空字符串)，则以它作为最终的生成内容。
        */
        'master': function (dest, html, data) {
            return template.transform(html, dest);
        },
    });

  
};
