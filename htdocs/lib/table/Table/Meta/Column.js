

define('Table/Meta/Column', function (require, module, exports) {

    var KISP = require('KISP');
    var $Array = KISP.require('Array');
    var $String = KISP.require('String');
    var $Object = KISP.require('Object');

    return exports = {

 
        create: function (opt) {
            var id = $String.random();  //列 id。

            //列结构。
            var column = {
                'name': opt.name,       //列名。
                'caption': opt.caption, //标题名。
                'index': opt.index,     //列的索引值，即第几列。
                'field': opt.field,     //该列的字段域。
                'table': opt.table,     //表格实例的自身，方便业务使用。

                'id': id,               //列 id，虚拟的，不用于生成 DOM id。
                'cells': [],            //该列所包含的单元格集合。
                'data': {},             //用户自定义数据容器。
                'deps': [],             //
                'infers': [],           //
                'type': 'Table.Column', //类型。
                'change': null,         //

                //对当前的所有单元格进行求和。
                'sum': function (fn) {
                    var sum = 0;

                    column.cells.map(function (cell, index) {
                        var value = fn ? fn.call(opt.table, cell, index) : cell.value;

                        if (value === null) {
                            return;
                        }

                        value = value || 0;

                        sum += value;
                    });

                    return sum;
                },
            };

            return column;
        },



    };

});


