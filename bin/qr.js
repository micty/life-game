
/**
* 打开本轻应用在 IIS 上所对应的 url 的二维码。
* 使用命令:
*   node qr
*   node qr 450
*/



start();

function start() {
    var master = require('web-master');

    //加载用于 new WebSite(defaults) 创建站点时的配置参数。
    var defaults = require('./config/defaults.js');


    master.launch(function (require, module, exports) {
        var WebSite = require('WebSite');

        var website = new WebSite(defaults);
        var width = process.argv[2];

        website.openQR({
            'width': width,
        });

    });
}