
/*
* 
*/
KISP.panel('/Game/Sidebar/Config', function (require, module, panel) {
    var KISP = require('KISP');
    var defaults = KISP.data(module.id);


    panel.on('init', function () {
        panel.$.on('change', 'input', function () {
            var info = module.exports.get();
            panel.fire('change', [info]);
        });
      
    });



    /**
    * 渲染。
    *
    */
    panel.on('render', function () {
        var width = document.body.clientWidth - 300;
        var height = document.body.clientHeight;
        var size = defaults.size;
        var size2 = 2 * size + 1;

        var row = Math.floor(height / size2);
        var column = Math.floor(width / size2);


        panel.fill({
            'row': row,
            'column': column,
            'frequency': 10,
            'size': size,

        });

  

        var info = module.exports.get();
        panel.fire('change', [info]);


    });



    return {
        get: function () {
            var row = +panel.$.find('input[name="row"]').val();
            var column = +panel.$.find('input[name="column"]').val();
            var size = +panel.$.find('input[name="size"]').val();
            var frequency = +panel.$.find('input[name="frequency"]').val();
            var interval = 1000 / frequency;
            var total = row * column;


            return {
                'row': row,
                'column': column,
                'frequency': frequency,
                'interval': interval,
                'total': total,
                'size': size,
            };
        },

        enable: function (enabled) {
            panel.$.toggleClass('disabled', !enabled);
        },
    };




});



