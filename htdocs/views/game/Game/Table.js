
/*
* 
*/
KISP.panel('/Game/Table', function (require, module, panel) {
    var KISP = require('KISP');
    var Table = require('Table');
    var Collection = module.require('Collection');

    var table = null;

    var meta = {
        row: 0,
        column: 0,
        size: 0,
    };


    
    panel.on('init', function () {

      
    });



    /**
    * 渲染。
    *   options = {
    *       row: 80,        //行数。
    *       column: 120,    //列数。
    *       size: 5,        //单元格大小。 padding 大小。
    *   };
    */
    panel.on('render', function (options) {

        var row = options.row;
        var column = options.column;
        var size = options.size;

        if (table) {
            //行数和列数不变，则复用。
            if (row == meta.row && column == meta.column) {
                if (size != meta.size) {
                    table.$.removeClass(`size-${meta.size}`);
                    table.$.addClass(`size-${size}`);
                    meta.size = size;
                }

                return;
            }

            table.destroy();
        }



        Object.assign(meta, options);

        table = new Table({
            'container': panel.container,
            'x': column,
            'y': row,
            'class': `size-${size}`,
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



