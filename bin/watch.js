/**
* 编译并进行监控。 
* 基本命令：`node watch`，后面可以带参数：
*   如果指定了 `compat` 选项，则使用兼容模式。 
*   具体会做 babel 转换，删掉所有标记了 data-meta="type=normal;" 的 <script> 标签等。
*
*   如果指定了 `pack` 选项，则使用独立打包的方式。 
*   具体以是 `htdocs` 目录中每个 `package.json` 文件作为配置，把相应的 less、html、js 等分别打包成文件，输出到 `htdocs/packages` 目录。
*
*   如果指定了 `open` 选项，则编译完成后，会打开网站。 
*   后面可以指定参数 `localhost` 或 `.` 作为网站的 host；如果不指定，则以本机 ip 作为 host。
*   
*   如果指定了 `qr` 选项，则编译完成后，会以本机 ip 作为 host，打开网站对应的二维码页面，以获取二维码。
*   后面可以指定参数 `450`，表示生成一个宽度为 450 像素的二维码图片。
*
* 注意，`open` 和 `qr` 不能同时指定。
*
* 完整的命令列表:
*
* `node watch`
*  
* `node watch qr`
* `node watch qr 450`
* `node watch open`
* `node watch open .`
* `node watch open localhost`
*  
* `node watch pack`
* `node watch pack qr`
* `node watch pack qr 450`
* `node watch pack open`
* `node watch pack open .`
* `node watch pack open localhost`
* 
* `node watch compat`
* `node watch compat qr`
* `node watch compat qr 450`
* `node watch compat open`
* `node watch compat open .`
* `node watch compat open localhost`
*  
* `node watch compat pack`
* `node watch compat pack qr`
* `node watch compat pack qr 450`
* `node watch compat pack open`
* `node watch compat pack open .`
* `node watch compat pack open localhost`
*  
*/

start();


function start() {
    var master = require('web-master');
    var _require = require; //原生的 require。

    /**
    * 解析命令行的参数。
    * 返回：
    *   args = {
    *       compat: false,  //是否使用了 `compat` 选项。 如果是，则使用兼容模式。
    *       pack: false,    //是否使用了 `pack` 选项。　如果是，则使用独立打包的方式。
    *       action: '',     //编译完成后要执行的动作。 如 `open` 或 `qr`。
    *       value: '',      //要传递给 action 的值。 如 `localhost`、`450`。
    *   };
    */
    var args = master.getArgs('watch');
    var defaults = require('./config/defaults.js');     //加载用于 new WebSite(defaults) 创建站点时的配置参数。
    var options = require('./config/watch.js');         //加载用于 website.watch(options) 进行监控的配置参数。


    //命令中指定了使用独立打包的方式，加载相应的配置。
    if (args.pack) {
        var pack = require('./config/defaults.pack.js');
        Object.assign(defaults.packages, pack.packages);

        pack = require('./config/watch.pack.js');
        Object.assign(options, pack);
    }




    master.on('init', function (require, module, exports) {
        var File = require('File');
        var mode = args.compat ? 'compat' : 'normal';       //compat: 兼容模式。 normal: 标准模式。
        var file = `./process/watch.${mode}.js`;            //如 `./process/watch.compat.js`。

        if (!File.exists(file)) {
            return;
        }

        var process = _require(file);
        var website = exports.website;
        var events = process(require, website, defaults);

        if (events) {
            website.on(events);
        }
    });

    master.on('done', function (require, module, exports) {
        console.log('...ooooOOOOoooo...'.bgMagenta);
    });



    master.watch({
        'args': args,
        'defaults': defaults,
        'options': options,
    });


}