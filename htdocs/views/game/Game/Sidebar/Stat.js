
/*
* 
*/
KISP.panel('/Game/Sidebar/Stat', function (require, module, panel) {
    var KISP = require('KISP');

    var meta = {
        'frame': 0,
        'checked': 0,
        'unchecked': 0,
        'total': 0,
    };


    panel.on('init', function () {
       
      
    });



    /**
    * 渲染。
    *   options = {
    *       frame: 0,       //帧数。
    *       checked: 0,     //激活的单元格数。
    *       total: 0,       //总的单元格数。
    *   };
    */
    panel.on('render', function (options) {
        Object.assign(meta, options);

        meta.unchecked = meta.total - meta.checked;


        panel.fill(meta);
    });




});



