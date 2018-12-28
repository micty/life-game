
define('Table.defaults', {
    '$': null,          //表格的容器。
    'fields': [],       //列的字段数组。
    'width': 0,         //表格宽度。
    'widths': [],       //列的宽度。
    'class': '',        //css class 类名。
    'process': {},      //
    'order': false,     //
    'details': [],      //每一行的详情数据。
    'columnName': 'fieldName',  //列的名称所在的字段名，即从 field[columnName] 中读取的值作为列名。
    'captionName': 'caption',  //列的标题所在的字段名，即从 field[captionName] 中读取的值作为列标题，主要是为了方便调试时查看。
});

