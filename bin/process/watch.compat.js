/**
* 针对兼容模式的处理。
* 即命令行中使用了 `node watch compat` 开头的的命令。
* 主要完成的功能：
*   1，对最外层的 `<template>` 标签内的 innerHTML 用一层 `<script type="text/template"></script>` 包裹起来。
*   2，删除所有元数据 `data-meta` 属性里含有 `type="normal"` 的 `<script>` 标签。
*   3，对符合条件的 `<script>` 标签做 babel 转码，修正 `src` 属性以引用到 babel 版本的文件。
*  
* 针对独立打包的方式，
* 即命令行中使用了 `node watch compat pack` 开头的的命令，
* 主要完成的功能：
*   1，对合并后、压缩前的 html 包文件进行 `<template>` 标签转换，参考上述的第 1 点。
*   2，对合并后、压缩前的 js 包文件进行 babel 转换。
*/



var babel = require('./lib/babel.js');
var template = require('./lib/template.js');


module.exports = function (require, website, defaults) {

    babel.init(require);
    template.init(require);


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


        /**
        * 生成 `<script>` 标签的 html 内容时触发。
        * 可以在此事件对原有的 `<script> 标签` 做进一步处理和转换等，如做 babel 转换。
        * 此处完成的功能：
        *   删除所有元数据 (data-meta) 属性里含有 `type="normal"` 的 `<script>` 标签。
        *   且对符合条件的 js 文件做 babel 转码，改写 `<script>` 标签以引用到 babel 版本的文件。
        */
        'js-link': function (file, html, data) {
            var item = data.item || {};
            var meta = item.meta || {};

            //显示指定为标准模式的，则删除该 `<script>` 标签。
            if (meta.type == 'normal') {
                return ''; //返回空字符串，表示删除内容。
            }

            //显式指定禁用 babel转码的。
            if (meta.babel == 'false') {
                return;
            }


            //符合条件的，作 babel 转码，且修正 `<script>` 标签以引用到 babel 版本的文件。
            return babel.render(file, data, {
                'htdocs': defaults.htdocs,      //网站的根目录。
                'dir': 'babel/',                // babel 文件的输出目录，相对于 htdocs。 最终结果如 `../htdocs/babel/`
            });
        },
    });

    
    /**
    * 针对使用了独立打包的方式。 
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

};
