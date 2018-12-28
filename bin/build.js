/**
* 构建生产环境的代码。 
* 基本命令：`node build`，后面可以带参数：
*   如果指定了 `compat` 选项，则使用兼容模式。 
*   具体会做 babel 转换，删掉所有标记了 data-meta="type=normal;" 的 <script> 标签等。
*
*   如果指定了 `pack` 选项，则使用独立打包的方式。 
*   具体以是 `htdocs` 目录中每个 `package.json` 文件作为配置，把相应的 less、html、js 等分别打包成文件，输出到 `htdocs/packages` 目录。
*
*   如果指定了 `dist` 选项，或别的名字，则使用指定的方案。
*   默认是 `dist`，表示使用 `./config/build.dist.js` 和 `/config/build.dist.pack.js` 的配置。
*   如果要创建自己的构建方案，则可以模仿 dist 的。
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
* `node build`
* `node build dist`
* 
* `node build qr`
* `node build qr 450`
* `node build open`
* `node build open .`
* `node build open localhost`
*  
* `node build dist qr`
* `node build dist qr 450`
* `node build dist open`
* `node build dist open .`
* `node build dist open localhost`
*  
* `node build pack`
* `node build pack qr`
* `node build pack qr 450`
* `node build pack open`
* `node build pack open .`
* `node build pack open localhost`
*  
* `node build pack dist`
* `node build pack dist qr`
* `node build pack dist qr 450`
* `node build pack dist open`
* `node build pack dist open .`
* `node build pack dist open localhost`
*  
* `node build compat`
* `node build compat qr`
* `node build compat qr 450`
* `node build compat open`
* `node build compat open .`
* `node build compat open localhost`
*  
* `node build compat dist`
* `node build compat dist qr`
* `node build compat dist qr 450`
* `node build compat dist open`
* `node build compat dist open .`
* `node build compat dist open localhost`
*  
* `node build compat pack`
* `node build compat pack qr`
* `node build compat pack qr 450`
* `node build compat pack open`
* `node build compat pack open .`
* `node build compat pack open localhost`
*  
* `node build compat pack dist`
* `node build compat pack dist qr`
* `node build compat pack dist qr 450`
* `node build compat pack dist open`
* `node build compat pack dist open .`
* `node build compat pack dist open localhost`
*  
*/


start();


function start() {
    var master = require('web-master');
    var _require = require;

    /**
    * 解析命令行的参数。
    *   args = {
    *       compat: false,  //是否使用兼容模式。
    *       pack: false,    //是否使用了 `pack` 选项。　如果是则使用独立打包的方式。
    *       scheme: '',     //构建要使用的配置方案的名称。 默认为 `dist`。
    *       action: '',     //编译完成后要执行的动作。 如 `open` 或 `qr`。
    *       value: '',      //要传递给 action 的值。 如 `localhost`、`450`。
    *   };
    */
    var args = master.getArgs('build');
    var defaults = require('./config/defaults.js');             //加载用于 new WebSite(defaults) 创建站点时的配置参数。
    var options = require(`./config/build.${args.scheme}.js`);  //加载用于 website.build(options) 进行监控的配置参数。 如 `build.dist.js`。



    //加载用于独立打包时的配置参数。
    if (args.pack) {
        var pack = require('./config/defaults.pack.js');
        Object.assign(defaults.packages, pack.packages);

        pack = require(`./config/build.${args.scheme}.pack.js`); //如 `build.dist.pack.js`。
        Object.assign(options, pack);
    }
    

    //增加额外的配置。
    master.on('init', function (require, module, exports) {
        var File = require('File');
        var mode = args.compat ? 'compat' : 'normal';           //compat: 兼容模式。 normal: 标准模式。
        var file = `./config/build.${args.scheme}.${mode}.js`;  //如 `./config/build.dist.compat.js`。

        if (!File.exists(file)) {
            return;
        }

        var config = _require(file);

        //增加额外的 excludes，即构建前要排除在外的文件或目录。
        var excludes = config.excludes || [];

        options.excludes = [...options.excludes, ...excludes];

    });



    //处理器。
    master.on('init', function (require, module, exports) {
        var File = require('File');
        var mode = args.compat ? 'compat' : 'normal';       //compat: 兼容模式。 normal: 标准模式。
        var file = `./process/build.${mode}.js`;            //如 `./process/build.compat.js`。

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
  

    master.build({
        'args': args,
        'defaults': defaults,
        'options': options,
    });


}







