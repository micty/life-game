
define('Navigator/Hash', function (require, module, exports) {
    var $ = require('$');
    var $String = require('String');
    var $Date = require('Date');
    var Hash = require('Hash');


    return {
        /**
        * 
        */
        init: function (meta) {
            //监听窗口 hash 的变化。
            Hash.onchange(window, true, function (hash, old, isImmediate) {
                //
                meta.hash = hash;

                //已禁用。
                //此值可给动态改变，因此需要每次都判断。
                if (!meta.enabled) {
                    return;
                }

                //此次已临时禁用事件。
                if (!meta.fireEvent) {
                    console.log('已设置为临时禁用事件。');
                    meta.fireEvent = true; //恢复启用事件，供下次使用。
                    return;
                }

                if (isImmediate) {
                    meta.emitter.fire('immediate', [hash, meta.hash$info]);
                }

                //空值。
                if (!hash) {
                    old = meta.router.toView(old);
                    meta.emitter.fire('none', [old]);
                    return;
                }


                //通过点击前进/后退按钮(或调用浏览器的前进/后退接口)，
                //或在地址栏中手动输入 hash 导致的变化。
                //此时 hash 值肯定非空(因为如果为空，前面就已拦截了)。
                var target = meta.hash$info[hash];   //可能为空。
                var current = meta.hash$info[old];   //可能为空。
                
                if (target) {
                    meta.emitter.fire('view', [target.view, target.args, {
                        'target': target,
                        'current': current,
                        'cache': true,
                    }]);

                    if (current) {
                        var direction = target.timestamp > current.timestamp ? 'forward' : 'back';
                        meta.emitter.fire(direction, [current.view, target.view]);
                    }
                    return;
                }


                hash = meta.router.toView(hash);
                old = meta.router.toView(old);

                //说明页面一进来时，地址栏中就含有了 hash。
                if (isImmediate) {
                    meta.emitter.fire('start', [hash, old]);
                }
                else {
                    meta.emitter.fire('404', [hash, old]);
                }

            });
        },

        /**
        * 
        */
        set: function (meta, hash) {
            Hash.set(window, hash);
        },
    };
});