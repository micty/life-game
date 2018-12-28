

module.exports = {

    //要复制到的构建目录。
    dir: '../build/dist/',

    //构建前要排除在外的文件或目录。
    excludes: [
        //'api/',         //开发测试用的。
        'packages/',    //生成的。
        'babel/',       //生成的。
        'data/demo/',   //组件示例的。
        'f/kisp/meta/', //kisp 中的元数据，仅用于方便开发者查看模块关系。
        'f/kisp/src/',  //kisp 的源模块文件，仅用于方便开发者查看源代码。
    ],

    //构建完成后需要清理的文件或目录。
    cleans: [
        'lib/',
        '**/modules/',
        '**/views/',
        'partial/',
        'routers/',

        '**/*.master.html',
        '**/*.less',
        '**/*.debug.css',
        '**/*.debug.js',
        '**/index.js',
    ],

    //需要进行内容转换的文件。
    process: {
        '**/*.js': function (file, content, require) {
            var $ = require('$');
            var BlockList = require('BlockList');
            var $Date = $.require('Date');
            var now = $Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');

            var list = [
                {
                    begin: '/**weber.debug.begin*/',
                    end: '/**weber.debug.end*/',
                    value: "KISP.data('build-time', '" + now + "');",
                },
                {
                    begin: '/**weber.test.begin*/',
                    end: '/**weber.test.end*/',
                    value: '',
                },
            ];

            list.forEach(function (item) {
                content = BlockList.replace(content, item);
            });

            return content;
        },
    },

    masters: {
        lessLink: {
            minify: true,
            name: '{md5}.css',  //如果指定则输出目标文件。
            query: {},
        },

        lessBlock: {
            minify: true,
            inline: false,
            name: '{md5}.css',
            props: {},
            query: {},
        },

        jsBlock: {
            begin: 'partial/begin.js',
            end: 'partial/end.js',
            minify: true,
            inline: false,
            name: '{md5}.js',
            props: {},
            query: {},
        },
        html: {
            //压缩选项详见: https://github.com/kangax/html-minifier。
            minify: {
                collapseWhitespace: true,   //折叠空白。 即删除空行、空格等，压缩最重要的体现。
                minifyJS: true,             //压缩 html 里的 js。
                keepClosingSlash: true,     //保留闭合斜线。
            },
        },
    },

};