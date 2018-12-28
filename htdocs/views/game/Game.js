
/*
* 
*/
KISP.view('/Game', function (require, module, view) {
    var KISP = require('KISP');
    var Sidebar = module.require('Sidebar');
    var Table = module.require('Table');



    view.on('init', function () {

        Sidebar.on({
            'apply': function (data) {
              
                Table.render(data);
            },

            'frame': function () {
                var info = Table.update();

                Sidebar.update(info);
            },

            'clear': function () {
                Table.clear();
            },
        });

        Table.on({
            'check': function (count) {
                Sidebar.update({ 'checked': count, });
            },
        });



    });


    view.on('render', function () {
        Sidebar.render();

       


    });




});



