
/**
* 
*/
define('Scroller/Pulldown/Indicator', function (require, module, exports) {
    var $ = require('$');
    var $String = require('String');
    var Panel = require('Panel');
    var Sample = module.require('Sample');



   

    return {
        /**
        *
        *   options = {
        *       container: Element,
        *       top: 10,
        *   };
        */
        create: function (options) {
            var id = $String.random();

            var html = $String.format(Sample, {
                'id': id,
            });

            $(options.container).append(html);


            var panel = new Panel(`#${id}`);

            panel.$.css({
                'top': options.top,
            });

            return panel;



        },
    };




});


