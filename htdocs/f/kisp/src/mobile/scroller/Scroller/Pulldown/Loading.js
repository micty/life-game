
/**
* 
*/
define('Scroller/Pulldown/Loading', function (require, module, exports) {
    var $ = require('$');
    var $String = require('String');
    var Loading = require('Loading');



   

    return {
        /**
        * 
        *   options = {
        *       container: Element,
        *       top: 10,
        *   };
        */
        create: function (options) {
            var loading = new Loading({
                'container': options.container,
                'presetting': 'scroller.pulldown',
                'z-index': 9999,

                'style': {
                    'top': options.top,
                },
            });

            return loading;
        },
    };




});


