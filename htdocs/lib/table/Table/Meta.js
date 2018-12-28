
/**
* 
*/
define('Table/Meta', function (require, module, exports) {

    var $ = require('$');
    var KISP = require('KISP');
    var $String = KISP.require('String');

    var Column = module.require('Column');


    return {

        create: function (config, others) {
            if (config.x) {
                var fields = ' '.repeat(config.x).split('').map(function (item, index) {

                    var field = {};



                    return {
                        [config.columnName]: `Column${index}`,

                    };

                });

                config.fields = fields;
                
            }

            if (config.y) {
                config.count = config.y;
            }


            var count = config.count || config.details.length;
            var name$column = {};
            var id$column = {};


            var columns = config.fields.map(function (field, index) {
                var name = field[config.columnName];
                var caption = field[config.captionName];

                //列结构。
                var column = Column.create({
                    'name': name,           //列名。
                    'caption': caption,     //标题名。
                    'index': index,         //列的索引值，即第几列。
                    'field': field,         //该列的字段域。
                    'table': others.this,   //表格实例的自身，方便业务使用。
                });

                name$column[name] = column;
                id$column[column.id] = column;

                return column;
            });



            var meta = {
                'id': $String.random(),

                'fields': config.fields,            //列的字段数组。
                'columnName': config.columnName,    //列名所在的字段名。
                'captionName': config.captionName,  //列标题所在的字段名。
                'details': config.details,          //原始的详情列表数据。
                'ctn': config.container,            //表格的容器。
                'width': config.width,              //表格宽度。
                'class': config.class,              //css 类名。
                'order': config.order,              //序号列。
                'attributes': config.attributes,    //自定义属性。 会在 html 中生成 `data-` 的自定义属性。

                'count': count,                     //首次要生成的行数。
                'columns': columns,                 //所有的列集合。
                'id$column': id$column,             //用随机 id 关联列。
                'name$column': name$column,         //命名的列。

                'rows': [],                         //所有的行记录集合。
                'id$row': {},                       //用随机 id 关联表格行元数据。
                'id$cell': {},                      //用随机 id 关联单元格元数据。

                'emitter': null,                    //
                'tpl': null,                        //模板实例。
                'element': null,                    //对应的 DOM 元素。
                '$': null,
                '$tbody': null,                     //方便内部使用。
                '$ctn': null,                       //$(ctn)
                'this': null,                       //方便内部使用。
            };




            Object.assign(meta, others);


           

            return meta;
           
        },


    };
    
});


