

define('Table/Row', function (require, module, exports) {
    var KISP = require('KISP');
    var $ = require('$');
    var $Array = KISP.require('Array');
    var $String = KISP.require('String');
    var $Object = KISP.require('Object');

    return exports = {
        /**
        * 创建并添加一个行记录，但不生成 html。
        */
        create: function (meta, detail) {
            var rows = meta.rows;
            var id = $String.random();  //行 id
            var index = rows.length;
            var data = Object.assign({}, detail);
            var name$cell = {};

            //行结构。
            var row = meta.id$row[id] = {
                'id': id,               //行 id。
                'index': index,         //行索引。
                'type': 'Table.Row',    //类型。
                'cells': null,          //单元格集合。
                'table': this,          //表格实例的自身，方便业务使用。
                'element': null,        //对应的 DOM 元素。
                'data': data,           //用户自定义数据容器。
                'name$cell': name$cell, //命名的单元格集合。
                'value': null,          //该表格行的任意类型的值，由业务层写入。
                'title': '',            //title 提示。
                'class': '',            //css 类名。
                'attributes': {         //生成到 html 中以 `data-` 开头的自定义属性。
                    'index': index,
                },
            };

            //提供一个快捷方法用于访问指定单元格的值。
            row.valueOf = function (name) {
                return name$cell[name].value;
            };

            row.cells = meta.fields.map(function (field, index) {
                var id = $String.random();          //单元格 id
                var column = meta.columns[index];   //当前列。
                var isOrder = meta.order.index == index;  //是否为序号列。
                var name = field[meta.columnName];
                var caption = field[meta.captionName];

                //单元格结构。
                var cell = meta.id$cell[id] = {
                    'id': id,               //单元格 id。
                    'name': name,           //列名。
                    'caption': caption,     //标题名。
                    'type': 'Table.Cell',   //类型。
                    'row': row,             //单元格所在的行引用。
                    'field': field,         //单元格（列）的字段域。
                    'index': index,         //所在的列的索引值。
                    'isOrder': isOrder,       //是否为序号列。
                    'column': column,       //所在的列引用。
                    'table': meta.this,     //表格实例的自身，方便业务使用。
                    'ctrl': null,           //用户控件。
                    'element': null,        //对应的 DOM 元素。
                    'value': null,          //该单元格的任意类型的值，由业务层写入。
                    'data': {},             //用户自定义数据容器。
                    'deps': column.deps,    //引用列中的数组，要注意引用关系。
                    'infers': column.infers,//
                    'title': '',            //title 提示。
                    'html': '',             //单元格的 innerHTML。

                    'class': field.class || '',     //css 类名。

                    'attributes': {         //生成到 html 中以 `data-` 开头的自定义属性。
                        'index': index,
                        'name': name,
                    },
                };

                //传入源单元格，避免联动形成回路。
                //执行该方法，以告诉内部该 cell 发生了变化，从而产生联动。
                cell.change = function (value, srcs) {
                    srcs = srcs || [];
                    srcs.push(cell);

                    cell.value = value;

                    console.log(srcs);


                    //依次调用同一行受影响的单元格的 change() 方法。
                    cell.infers.map(function (name) {
                        var col = meta.name$column[name];
                        var infer = name$cell[name];    //受影响的单元格。
                        var change = col.change;        //受影响的单元格的处理器。

                        ////第一个条件表示是因为 src 单元格的变化导致当前单元格(cell)发生变化，
                        ////而当前单元格(cell)的变化又会导致 src 单元格(infer)变化，形成了回路。
                        //if (infer === src || !change) {
                        //    return;
                        //}

                        if (srcs.includes(infer) || !change) {
                            return;
                        }


                        var value = change.apply(infer, [cell, srcs]);

                        if (value !== undefined) {
                            infer.value = value;
                        }
                    });

                    meta.emitter.fire('change', cell.name, [cell]);
                    meta.emitter.fire('change', [cell]);

                };

                column.cells.push(cell);
                name$cell[name] = cell;

                return cell;
            });

            rows.push(row);


            return row;
        },


        add: function (meta, data) {
            var no = meta.rows.length;

            var row = exports.create(meta, data);
            var html = meta.tpl.fill('tr', row, no);

            //处理 UI 上的。
            meta.$tbody.append(html);
            row.element = document.getElementById(row.id);

            row.cells.map(function (cell) {
                cell.element = document.getElementById(cell.id);
               
            });

            return row;
        },

        /**
        * 删除一个指定行号的表格行。
        */
        remove: function (meta, no) {
            var rows = meta.rows;
            var row = rows[no];


            //从数据上删除。
            rows.splice(no, 1);
            delete meta.id$row[row.id];


            row.cells.map(function (cell) {
                var ctrl = cell.ctrl;

                ctrl && ctrl.destroy();
                delete meta.id$cell[cell.id];

                cell.ctrl = null;
                cell.element = null;
            });


            meta.columns.map(function (column, index) {
                column.cells.splice(no, 1);
            });


            //从 UI 上删除。
            var tr = row.element;
            tr && tr.parentNode.removeChild(tr);
            row.element = null;



            //被删除的那一行之后的所有序号需要调整。
            rows.slice(no).map(function (row, index) {
                index = row.index = index + no;

                //更新 tr 中的 `data-index`
                if ('index' in row.attributes) {
                    row.element.setAttribute('data-index', index);
                    row.attributes.index = index;
                }

                if (meta.order) {
                    var tpl = meta.tpl;
                   
                    row.cells.map(function (cell) {
                        if (!cell.isOrder) {
                            return;
                        }

                        var html = tpl.fill('tr', 'td', cell, 0, index);
                        cell.element.innerHTML = html;
                    });
                }

            });

      

            return row;

        },

        /**
        * 把指定行号的表格行向前或向后移动若干步。
        */
        move: function (meta, index, step) {
            var rows = meta.rows;
            var targetIndex = index + step;

            if (step == 0 || targetIndex < 0 || targetIndex > rows.length - 1) {
                return;
            }

            var current = rows[index];
            var target = rows[targetIndex];
            var tbody = current.element.parentNode;

            rows.splice(index, 1);
            rows.splice(targetIndex, 0, current);

            if (step > 0) {
                tbody.insertBefore(target.element, current.element);
            }
            else {
                tbody.insertBefore(current.element, target.element);
            }


            //需要调整序号。
            rows.map(function (row, index) {
                if (row.index == index) {
                    return;
                }

                row.index = index;

                //更新 tr 中的 `data-index`
                if ('index' in row.attributes) {
                    row.element.setAttribute('data-index', index);
                    row.attributes.index = index;
                }

                meta.order && row.cells.map(function (cell) {
                    if (!cell.isOrder) {
                        return;
                    }

                    var html = meta.tpl.fill('tr', 'td', cell, 0, index);
                    cell.element.innerHTML = html;
                });

            });

            meta.emitter.fire('move', [current, step]);


        },


    };

});


