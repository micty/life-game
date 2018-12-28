

define('Table/Static', function (require, module, exports) {

    var $ = require('$');
    var KISP = require('KISP');
    var Emitter = KISP.require('Emitter');
    var $Array = KISP.require('Array');
    var $String = KISP.require('String');
    var $Object = KISP.require('Object');
    var Defaults = require('Defaults');
    

    return exports = {
        /**
        * 迭代每个单元格，并执行回调函数。
        * 已重载 eachCell(cell, fn);
        * 已重载 eachCell(row, fn);
        * 已重载 eachCell(column, fn);
        * 已重载 eachCell(cells, fn);
        * 已重载 eachCell(colomns, fn);
        */
        eachCell: function (list, fn) {
            if (!Array.isArray(list)) {
                list = [list];
            }

            var cells = [];

            list.map(function (item) {
                switch (item.type) {
                    case 'Table.Cell':
                        cells.push(item);
                        break;

                    case 'Table.Column':
                    case 'Table.Row':
                        cells = cells.concat(item.cells);
                        break;

                    default:
                        throw new Error('无法识别的 type 值: ' + type);
                }
            });

            cells.map(fn);
        },

        /**
        * 迭代处理指定列的每个单元格，并执行回调函数。
        * 已重载 column(table, fn);
        * 已重载 column(row, fn);
        * 已重载 column(rows, fn);
        */
        column: function (table, name, fn) {
            var cells = [];

            if (Array.isArray(table)) { //rows
                var rows = table;
                rows.map(function (row) {
                    if (!exports.isRow(row)) {
                        return;
                    }

                    var cell = row.name$cell[name];
                    if (cell) {
                        cells.push(cell);
                    }
                });
            }
            else if (exports.isRow(table)) { //row
                var row = table;
                var cell = row.name$cell[name];

                if (cell) {
                    cells.push(cell);
                }
            }
            else { //table
                var name$column = table.get('name$column');
                var column = name$column[name];

                if (column) {
                    cells = column.cells || [];
                }
            }

            cells.map(function (cell, index) {
                fn(cell, index);
            });
        },

        isCell: function (item) {
            return $Object.isPlain(item) && item.type == 'Table.Cell';
        },

        isRow: function (item) {
            return $Object.isPlain(item) && item.type == 'Table.Row';
        },

        isColumn: function (item) {
            return $Object.isPlain(item) && item.type == 'Table.Column';
        },

    };

});


