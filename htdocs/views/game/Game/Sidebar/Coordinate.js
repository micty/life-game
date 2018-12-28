
/*
* 
*/
KISP.panel('/Game/Sidebar/Coordinate', function (require, module, panel) {
    var KISP = require('KISP');



    panel.on('init', function () {
       
      
    });



    /**
    * 渲染。
    *   options = {
    *       x: 0,       //列号。
    *       y: 0,       //行号。
    *   };
    */
    panel.on('render', function (options) {
        options = options || {
            x: '',
            y: '',
        };

        panel.fill(options);
    });




});



