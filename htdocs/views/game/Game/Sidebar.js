
/*
* 
*/
KISP.panel('/Game/Sidebar', function (require, module, panel) {
    var KISP = require('KISP');

    var Operator = module.require('Operator');
    var Config = module.require('Config');
    var Stat = module.require('Stat');


    var meta = {
        frames: 0,      //帧数计数。
        interval: 0,    //时间间隔。
        total: 0,       //总单元格数。
    };




    panel.on('init', function () {
        var tid = null;

        function start() {
            tid = setTimeout(function () {
                meta.frames++;
                panel.fire('frame');

                //说明还没发出停止的命令。
                if (tid) {
                    start();
                }

            }, meta.interval);

        }


        Operator.on({
            'start': function () {
                if (!tid) {
                    start();
                    Config.enable(false);
                }
            },

            'stop': function () {
                clearTimeout(tid);
                tid = null;
                Config.enable(true);

            },

            'clear': function () {
                meta.frames = 0;

                Stat.render({
                    'frame': 0,
                    'checked': 0,
                });

                panel.fire('clear');

            },
        });



        Config.on({
            'change': function (data) {
                meta.interval = 1000 / data.frequency;
                meta.total = data.total;

                panel.fire('apply', [data]);
            
            },
        });
      
    });






    /**
    * 渲染。
    *   options = {
    *   };
    */
    panel.on('render', function (options) {
        Operator.render();
        Config.render();

        Stat.render({
            'frame': 0,
            'checked': 0,
            'total': meta.total,
        });
    });



    return {
        update: function (data) {
            Stat.render({
                'checked': data.checked,
                'frame': meta.frames,
                'total': meta.total,
            });
        },
    };
});



