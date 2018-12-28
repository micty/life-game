/**
* 针对兼容版。
*/

module.exports = {


    //构建前要排除在外的文件或目录。
    excludes: [
        //'f/kisp/kisp.debug.css',  //js 分 babel 版本，但 css 的不区分，所以要保留。
        'f/kisp/kisp.debug.js',
        //'f/kisp/kisp.min.css',    //js 分 babel 版本，但 css 的不区分，所以要保留。
        'f/kisp/kisp.min.js',
    ],


};