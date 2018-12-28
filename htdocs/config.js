
(function () {

    //业务层自定义的数据。

    KISP.data({
        '/Game/Sidebar/Config': {
            size: 5,
        },
    });



    // KISP 内部模块所需要的默认配置
    KISP.config({
       

        'App': {
            name: 'life-game-ELDFL55654447',
        },

        'Proxy': {
            base: 'api/',
        },

        'Mask': {
            'opacity': 0.5,
        },

        'View': {

        },

        'Navigator': {
            simulate: true,
        },
    });








    /**weber.debug.begin*/
    //------------------------------------------------------------------------
    //开发过程中用到的配置，正式发布后可去掉。 
    //web-master 自动化工具会自动删掉的。



    var alert = window.alert;

    window.alert = function () {
        var $ = KISP.require('$');
   
        var args = Array.from(arguments).map(function (item, index) {
            if (typeof item == 'object') {
                return JSON.stringify(item, null, 4);
            }

            return String(item);
        });

        alert(args.join(', '));
    };


    //----------------------------------------------------------------------------------------
    /**weber.debug.end*/




})();

