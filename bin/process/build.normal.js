
/**
*
*/




module.exports = function (require, website, defaults) {
    var JsLink = require('JsLink');
    var Lines = require('Lines');



    website.on('parse', {
        'master': function (file, content, data) {
            var lines = Lines.split(content);

            var links = JsLink.parse(content, {
                'dir': data.dir,
            });

            links.forEach(function (item) {
                var meta = item.meta;

                if (meta.type == 'compat') {
                    lines[item.no] = '';
                    return;
                }
            });

            content = Lines.join(lines);

            return content;
        },
    });


};
