
/**
* 打开本轻应用在 IIS 上所对应的 url。
* 使用命令:
*   node open
*   node open localhost
*   node open .
*/


start();


function start() {
    var master = require('web-master');

    //加载用于 new WebSite(defaults) 创建站点时的配置参数。
    var defaults = require('./config/defaults.js');


    master.launch(function (require, module, exports) {
        var WebSite = require('WebSite');

        var website = new WebSite(defaults);
        var host = process.argv[2];

        if (host == '.') {
            host = 'localhost';
        }

        website.open({
            'host': host,
        });

    });
}