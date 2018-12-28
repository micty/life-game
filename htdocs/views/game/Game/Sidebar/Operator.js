
/*
* 
*/
KISP.panel('/Game/Sidebar/Operator', function (require, module, panel) {
    var KISP = require('KISP');


    var running = false;

    panel.on('init', function () {
        var tpl = panel.template();
        tpl.fix('disabled');


        panel.$on('click', {
            '[data-cmd="run"]': function () {
                running = !running;
                panel.render();
                panel.fire(running ? 'start' : 'stop');
            },

            '[data-cmd="clear"]': function () {
                panel.fire('clear');

            },
        });

      
    });



    /**
    * 渲染。
    *
    */
    panel.on('render', function () {

        panel.fill({
            'text': running ? '停止...' : '开始',
            'class': running ? 'running' : '',
            'disabled': running ? 'disabled' : '',
        });

    });







});



