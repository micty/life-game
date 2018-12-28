


define('Table/Order', function (require, module, exports) {

    var KISP = require('KISP');
    var $Array = KISP.require('Array');
    var $String = KISP.require('String');
    var $Object = KISP.require('Object');


    var defaults = {
        sample: '{order}',
        add: true,
        index: 0,
    };


    return exports = {

        normalize: function (config) {
            var order = config.order;

            if (!order) {
                return config;
            }

            if (order === true) {
                order = {};
            }

            order = Object.assign({}, defaults, order);


            var fields = config.fields.slice(0);
            var item = { [config.columnName]: 'order', caption: '序号', };
            var index = order.index;

            if (order.add) {
                fields.splice(index, 0, item); //在指定位置插入。
            }
            else {
                fields[index] = item;
            }

    
            config = Object.assign({}, config, {
                'order': order,
                'fields': fields,
            });

            return config;

        },


    };

});


