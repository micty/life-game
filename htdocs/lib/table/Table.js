
/**
* 自定义表格。
*/
define('Table', function (require, module, exports) {
    var $ = require('$');
    var KISP = require('KISP');
    var Emitter = KISP.require('Emitter');
    var $Array = KISP.require('Array');
    var $String = KISP.require('String');
    var $Object = KISP.require('Object');
    var Defaults = require('Defaults');

    var Reaction = module.require('Reaction');
    var Static = module.require('Static');
    var Template = module.require('Template');
    var Row = module.require('Row');
    var Order = module.require('Order');
    var Meta = module.require('Meta');

    var mapper = new Map();


    /**
    * 构造器。
    */
    function Table(config) {
        config = Defaults.clone(module, config);
        config = Order.normalize(config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'emitter': emitter,         //
            'this': this,               //方便内部使用。
        });

       

        meta.tpl = Template.create(meta);
        mapper.set(this, meta);


        Object.assign(this, {
            'id': meta.id,
            'meta': meta,
        });

        for (var i = 0; i < meta.count; i++) {
            this.new(meta.details[i]);
        }


        var reaction = config.reaction;
        if (reaction) {
            this.reaction(reaction);
        }

        //提供默认的单元格内容填充方式。
        this.on('process', 'cell', function (cell) {
            var item = cell.row.data || {};
            return item[cell.name];
        });

    }




    Table.prototype = {
        constructor: Table,

        id: '',
        $: null,

        render: function () {
            var meta = mapper.get(this);
            var rows = meta.rows;
            var html = meta.tpl.fill({});

            meta.$ctn = $(meta.ctn);

            if (!meta.$ctn.length) {
                throw new Error('不存在容器节点: ' + meta.ctn);
            }

            meta.$ctn.html(html);

            this.length = meta.rows.length;

            meta.rows.map(function (row) {
                meta.this[row.index] = row;

                row.element = document.getElementById(row.id);
                row.$ = $(row.element);
                row.length = row.cells.length;

                row.cells.map(function (cell) {
                    cell.element = document.getElementById(cell.id);
                    cell.$ = $(cell.element);

                    cell.x = cell.index;    //列号。
                    cell.y = row.index;     //行号。

                    //相邻的格子。
                    cell.neighbors = [];

                    row[cell.index] = cell;
                });
            });

            meta.element = document.getElementById(meta.id);
            meta.$ = this.$ = $(meta.element);
            meta.$tbody = meta.$.find('>tbody');


           

            meta.fields.forEach(function (field, index) {
                var delegate = field.delegate;
                if (!delegate) {
                    return;
                }

                //统一转成数组来处理。
                //外面传进来的 delegate 支持为单个的字符串，也支持多个字符串组成的数组。
                var delegates = Array.isArray(delegate) ? delegate : [delegate];

                delegates.forEach(function (delegate) {
                    var selector = '>tr>td[data-name="' + field[meta.columnName] + '"] ' + delegate;

                    meta.$tbody.on('click', selector, function (event) {
                        var parents = $(this).parents().toArray();
                        var len = parents.length;

                        //向上追溯父节点，直到找到 id 符合注册的 cell 为止。
                        //该算法是安全的，因为 id 是内部随机生成的，跟外面的冲突的概率很小。
                        for (var i = 0; i < len; i++) {
                            var el = parents[i];
                            var id = el.id;
                            var cell = meta.id$cell[id]; //根据 id 能找到注册的 cell。

                            //触发四级事件。
                            if (cell) {
                                meta.emitter.fire('click', 'cell', cell.name, delegate, [cell, event, this]);
                                break;
                            }
                        }
                    });
                });
                
            });

            //单元格的点击事件。
            meta.$tbody.on('click', '>tr>td', function (event) {
                var cell = meta.id$cell[this.id];
                meta.emitter.fire('click', 'cell', cell.name, [cell, event]);
                meta.emitter.fire('click', 'cell', [cell, event]);
            });

            //表格行的点击事件。
            meta.$tbody.on('click', '>tr', function (event) {
                var row = meta.id$row[this.id];
                meta.emitter.fire('click', 'row', [row, event]);
            });

            //整个表格的点击事件。
            meta.$tbody.on('click', function (event) {
                meta.emitter.fire('click', [event]);
            });

            meta.emitter.fire('render', [rows]);

            return html;
        },

        each: function (fn) {
            var meta = mapper.get(this);

            meta.rows.forEach(function (row) {
                row.cells.forEach(function (cell) {
                    fn && fn(cell);
                });
            });
        },

        /**
        * 创新并添加一个行记录，但不生成 html。
        */
        new: function (detail) {
            var meta = mapper.get(this);
            var row = Row.create(meta, detail);
            meta.emitter.fire('new', [row, detail]);
            return row;
        },


        /**
        * 添加一条或多条行记录。
        */
        add: function (data) {
            var meta = mapper.get(this);

            //重载 add([...]); 批量添加的情况。
            if (Array.isArray(data)) {
                var rows  = data.map(function (item) {
                    return Row.add(meta, item);
                });

                meta.emitter.fire('add', [rows]);
                return rows;
            }

            var row = Row.add(meta, data);
            meta.emitter.fire('add', [row]);

            return row;
        },



        /**
        * 移除指定索引值的行记录。
        * @param {Number} no 要移除的行号。 如果不指定，则为最后一行。
        */
        remove: function (no) {
            var meta = mapper.get(this);

            //如果不指定行号，则删除最后一行。
            if (typeof no != 'number') {
                no = meta.rows.length - 1;
            }

            var row = Row.remove(meta, no);

            meta.emitter.fire('remove', [row, no]);
        },

        /**
        * 把指定表格行向前或向后移动若干步。
        * 已重载 move(index, step);
        * 已重载 move(id, step);
        * 已重载 move(row, step);
        */
        move: function (item, step) {
            var meta = mapper.get(this);
            var type = typeof item;

            var row = type == 'number' ? meta.rows[item] :
                type == 'string' ? meta.id$row[item] :
                type == 'object' ? meta.id$row[item.id] : null;

            if (!row) {
                throw new Error('传入的参数 item 不属性当前 table 的表格行。');
            }

            Row.move(meta, row.index, step);
        },


        fill: function (list) {
            this.clear();

            var meta = mapper.get(this);

            var rows = list.map(function (item) {
                var row = this.new(item);
                return row;

            }, this);

            var html = meta.tpl.fill('tr', rows);
            meta.$tbody.html(html);


            rows.map(function (row) {
                row.element = document.getElementById(row.id);

                row.cells.map(function (cell) {
                    cell.element = document.getElementById(cell.id);
                });
            });

            meta.emitter.fire('fill', [list]);
        },


        clear: function () {
            var meta = mapper.get(this);

            meta.rows.map(function (row) {
                row.cells.map(function (cell) {
                    var ctrl = cell.ctrl;
                    ctrl && ctrl.destroy && ctrl.destroy();
                });
            });

            meta.columns.map(function (column) {
                column.cells.splice(0);
            });

            meta.id$row = {};
            meta.id$cell = {};
            meta.rows.splice(0);     //清空原数组。
            meta.$tbody.html('');
            meta.emitter.fire('clear');

        },


        /**
        * 获取指定的属性值。
        */
        get: function (key) {
            var meta = mapper.get(this);
            var rows = meta.rows;

            //重载 get(); 获取全部行。
            if (arguments.length == 0) {
                return rows;
            }

            //重载 get(no); 获取指定索引值的行。
            if (typeof key == 'number') {
                return rows[key];
            }

            switch (key) {
                case 'id$row':
                case 'id$cell':
                case 'id$column':
                case 'name$column':
                case 'rows':
                case 'columns':
                case 'element':
                case 'details':
                    return meta[key];

                case 'length':
                    return rows.length;
            }

            //此时作为 id 去判断。
            if (typeof key == 'string') {
                return meta.id$cell[key] || 
                    meta.id$row[key] || 
                    meta.id$column[key];
            }

        },

        set: function (key, value) {
            var meta = mapper.get(this);

            switch (key) {
                case 'width':
                    meta[key] = value;
                    break;
                //todo...
            }
        },

        column: function (name, fn) {
            var meta = mapper.get(this);
            var column = meta.name$column[name];

            if (!column) {
                console.warn('不存在名为 ' + name + ' 的列。');
                return;
            }

            column.cells.map(function (cell, index) {
                fn && fn(cell, index);
            });

            return column;
        },

        /**
        * 设置列的单元格监听规则和处理函数。
        * 已重载 reaction({ name: { deps: [], change: fn } }); 批量混写的情况 。
        * 已重载 reaction({ name: deps }); 批量设置 deps 数组的情况。
        * 已重载 reaction({ name: change }); 批号设置 change 函数的情况。
        * 已重载 reaction(name, { deps: [], change: fn }); 单个混写的情况。
        * 已重载 reaction(name, change); 单个设置 change 函数的情况。
        * 已重载 reaction(name, deps); 单个设置 deps 数组的情况。
        */
        reaction: function (name, deps, change) {
            var meta = mapper.get(this);
            Reaction.set.call(meta.name$column, ...arguments);
        },


        destroy: function () {
            var meta = mapper.get(this);

            //已销毁。
            if (!meta) {
                return;
            }

            var table = meta.element;

            meta.tpl.destroy();
            meta.emitter.destroy();
            table.parentNode.removeChild(table);
            meta.$tbody.off();
            meta.$.off();

            $Object.each(meta.id$cell, function (id, cell) {
                var ctrl = cell.ctrl;
                ctrl && ctrl.destroy && ctrl.destroy();
            });

            mapper.delete(this);

        },

        on: function () {
            var meta = mapper.get(this);
            meta.emitter.on(...arguments);
        },

        /**
        * 按指定条件进行过滤。
        */
        filter: function (fn) {
            var meta = mapper.get(this);
            var list = [];

            this.each(function (cell) {
                var value = fn(cell);
                if (value === true) {
                    list.push(cell);
                }
            });

            return list;

        },

        /**
        * 按指定条件进行统计。
        */
        stat: function (fn) {
            var list = this.filter(fn);
            return list.length;
        },


  

    };


    //同时提供静态成员。
    Object.assign(Table, Static);


    return Table;

});


