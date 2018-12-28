
var decode = require('html-entities-decoder');
var $require = null;  //web-master 内部使用的 require 方法。


function checkFull(content) {
    content = content.toLowerCase(); //统一转小写。

    if (!content.endsWith('</html>')) {
        return false;
    }

    if (!content.includes('<html')) {
        return false;
    }


    if (content.startsWith('<!doctype html>')) {
        return true;
    }

    if (content.startsWith('<html>')) {
        return true;
    }

    if (content.startsWith('<html >')) {
        return true;
    }

    return false;

}



module.exports = {

    init: function (require) {
        $require = require;
    },

    /**
    * 对指定的 html 内容中所有首层的 `<template>` 标签进行转换。
    * 即把所有首层的 `<template>` 标签的 innerHTML 
    * 用一对 `<script type="text/template"></script>` 包裹起来。
    * 首层 `<template>` 标签是指它的所有父节点中，不存在 `<template>` 节点。
    * 换言之，如果一个 `<template>` 节点 A 位于另一个 `<template>` 节点 B 中，
    * 则节点 A 不属于首层 `<template>` 标签。
    * 参数：
    *   content: '',    //必选。 要转换的 html 内容。
    *   file: '' || [], //可选。 用于提示的一个或文件路径。
    */
    transform: function (content, file) {
        var cheerio = $require('cheerio');
        var $ = cheerio.load(content);
        var tpls = $('template').toArray();

        //没有需要转换的。
        if (!tpls.length) {
            return content;
        }
      
        var desc = Array.isArray(file) ? '内容合并后的' : '';

        console.log(`转换${desc} <template> 标签`.bgCyan, file);


        tpls.forEach(function (tpl, index) {
            var html = $(tpl).html();

            var holder = `<script type="text/template">${html}</script>`;

            $(tpl).html(holder);
        });

        console.log(`转换了 ${tpls.length} 个 <template> 标签`.cyan);


        var isFullPage = checkFull(content); //判断 content 是否为完整的页面。
        console.log('isFullPage', isFullPage);
        var html = $.html();

        html = decode(html); //把 `&#x` 之类的编码解码回真实的中文。

        //是完整的页面，直接返回。
        if (isFullPage) {
            return html;
        }


        //是 html 片段。
        //因为 $.html() 方法会对 html 片段自动加上 `<html><head></head><body>...</body></html>` 来包裹着，
        //所以需要还原，即解包裹。

        var beginTag = '<html><head></head><body>';
        var endTag = '</body></html>';
        
        if (html.startsWith(beginTag)) {
            html = html.slice(beginTag.length);
        }

        if (html.endsWith(endTag)) {
            html = html.slice(0, 0 - endTag.length);
        }

        return html;

    },

};