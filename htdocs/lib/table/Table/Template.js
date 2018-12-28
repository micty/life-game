

define('Table/Template', function (require, module) {

    var $ = require('$');
    var Template = KISP.require('Template');
    var $Array = KISP.require('Array');
    var $String = KISP.require('String');


    function stringify(attributes) {
        if (!attributes) {
            return '';
        }

        attributes = Object.entries(attributes).map(function (item) {
            var key = item[0];
            var value = item[1];
            return 'data-' + key + '="' + value + '"';
        });

        return attributes.join(' ');
    }

    function getTitle(obj) {
        var title = obj.title;

        if (title === undefined || title === '') {
            return '';
        }

        return 'title="' + title + '"';
    }

    function getClass(obj) {
        var list = obj.class;
        if (Array.isArray(list)) {
            list = list.join(' ');
        }

        if (!list) {
            return '';
        }

        return 'class="' + list + '"';
       
    }


    return {
        create: function (meta) {
            var tpl = new Template('#tpl-Table');
            var emitter = meta.emitter;


            tpl.process({
                '': function () {
                    this.fix('attributes');

                    var width = meta.width || '';

                    if (width) {
                        width = 'width: ' + width + 'px;';
                    }

                    var rows = this.fill('tr', meta.rows);
                    var attributes = stringify(meta.attributes);
                    var cssClass = meta.class || '';

                    return {
                        'id': meta.id,
                        'class': cssClass + ' Table',
                        'width': width,
                        'rows': rows,
                        'attributes': attributes,
                    };
                },
                'tr': {
                    '': function (row, no) {
                        this.fix(['class', 'attributes', 'title']);

                        emitter.fire('process', 'row', [row, no]);

                        var attributes = stringify(row.attributes);
                        var cells = this.fill('td', row.cells, no);
                        var title = getTitle(row);
                        var cssClass = getClass(row);

                        return {
                            'id': row.id,
                            'class': cssClass,
                            'attributes': attributes,
                            'title': title,
                            'cells': cells,
                        };
                    },

                    'td': {
                        '': function (cell, index, no) {
                            this.fix(['class', 'attributes', 'title']);

                            var html = '';

                            if (cell.isOrder) {
                                html = $String.format(meta.order.sample, {
                                    'index': index,     //列索引。
                                    'no': no,           //行索引。
                                    'order': no + 1,    //行号。
                                });
                            }
                            else {
                                var values = emitter.fire('process', 'cell', cell.name, [cell, index]);
                                html = values.slice(-1)[0]; //以最后一个为准。

                                //具体命名单元格的事件没有返回值，则再次触发统一 cell 的事件。
                                if (html === undefined) {
                                    values = emitter.fire('process', 'cell', [cell, index]);
                                    html = values.slice(-1)[0]; //以最后一个为准。
                                }
                          

                                var type = typeof html;

                                if (type == 'number' || type == 'boolean') {
                                    html = String(html);
                                }
                            }

                            var display = cell.field.visible === false ? 'display: none;' : '';
                            var attributes = stringify(cell.attributes);
                            var title = getTitle(cell);
                            var cssClass = getClass(cell);

                            return {
                                'id': cell.id,
                                'cid': cell.column.id, //列 id
                                'html': html || '',
                                'class': cssClass,
                                'attributes': attributes,
                                'display': display,
                                'title': title,
                            };
                        },

                    },
                },
            });

            return tpl;

        },

    };

});

