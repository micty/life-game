
/*
* 
*/
KISP.panel('/Game/Table', function (require, module, panel) {
    var KISP = require('KISP');
    var Table = require('Table');
    var Collection = module.require('Collection');

    var table = null;




    panel.on('init', function () {

      
    });



    /**
    * 渲染。
    *   options = {
    *       row: 80,        //行数。
    *       column: 120,    //列数。
    *       size: 20,       //单元格大小。
    *   };
    */
    panel.on('render', function (options) {
        if (table) {
            table.destroy();
        }

        table = new Table({
            'container': panel.container,
            'x': options.column,
            'y': options.row,
            'class': `size-${options.size}`,
        });

        table.on('click', {
            'cell': function (cell, event) {
                var count = 0;
                var data = cell.data;
                var checked = data.checked = !data.checked;

                cell.$.toggleClass('on', checked);

                var count = table.stat(function (cell) {
                    return !!cell.data.checked;
                });

                panel.fire('check', [count]);
            },
        });


        table.render();

        
    });


    return {
        /**
        * 清空。
        */
        clear: function () {
            if (!table) {
                return;
            }

            table.each(function (cell) {
                cell.data.checked = false;
                cell.$.removeClass('on');
            });
        },


        /**
        * 更新。
        */
        update: function () {
            var todos = Collection.get(table);

            todos.forEach(function (cell) {
                var data = cell.data;
                var checked = data.checked = !data.checked;

                cell.$.toggleClass('on', checked);
            });


            var count = table.stat(function (cell) {
                return !!cell.data.checked;
            });

            return {
                'checked': count,
            };
        },
    };




});



