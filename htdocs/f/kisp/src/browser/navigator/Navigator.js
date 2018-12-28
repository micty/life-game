
/**
* 基于浏览器地址栏 hash 的状态导航器。
* @class
* @name Navigator
*/
define('Navigator', function (require, module, exports) {
    var $String = require('String');
    var Defaults = require('Defaults');
    var Emitter = require('Emitter');
    var Meta = module.require('Meta');
    var Hash = module.require('Hash');
    var Router = module.require('Router');

    var mapper = new Map();


    /**
    * 构造器。
    * 已重载 Navigator(config);
    * 已重载 Navigator(id, config);
    */
    function Navigator(id, config) {
        if (typeof id == 'object') {
            config = id;
        }
        else {
            config = Object.assign({ 'id': id, }, config);
        }


        config = Defaults.clone(module.id, config);

        var emitter = new Emitter(this);
        var router = Router.create();

        var meta = Meta.create(config, {
            'emitter': emitter,
            'router': router,
        });

        mapper.set(this, meta);


        Object.assign(this, {
            'id': meta.id,
            '_meta': meta,   //暂时暴露。
        });

        //是否启用模拟传统多页面的路由转换器。
        if (config.simulate) {
            this.route(Navigator.simulate);
        }
    }



    Navigator.prototype = {
        constructor: Navigator,

        /**
        * 当前实例 id。
        */
        id: '',

        /**
        * 渲染。
        * 启用并开始 hash 监听。
        */
        render: function () {
            var meta = mapper.get(this);

            //自动启用。
            this.enable(true);

            if (!meta.rendered) {
                Hash.init(meta);
            }
        },

        /**
        * 设置 hash 与 view 的路由关系。
        * 即 hash 与 view 之间的映射转换关系。
        *   options = {
        *       静态如果明确指定为 null，则清空之前的。
        *       否则，合并覆盖。
        *       view$hash: {},
        *       hash$view: {},
        *
        *       //视图到 hash 的转换函数。 
        *       //在调用 to() 方法时会先调用此函数。 
        *       //如 `UserList` -> `/user-list.html`。
        *       //该函数会接收到参数: view，传入的视图名，如 `UserList`。 
        *       //该函数应该返回要生成的 hash 值，如 `/user-list.html`。
        *       toHash: function (view) { },
        *
        *       //hash 到视图的转换函数。 
        *       //在触发某个事件时，会把相应的 hash 作转换，以还原回原来的视图名。 
        *       //如 `/user-list.html` -> `UserList`
        *       //该函数会接收到参数: hash，地址栏中的 hash 值，如 `/user-list.html`。 
        *       //该函数应该返回要还原的视图名，如 `UserList`。
        *       toView: function (hash) { },
        *   };
        */
        route: function (options) {
            var meta = mapper.get(this);
            var router = meta.router;
            var view$hash = options.view$hash;
            var hash$view = options.hash$view;
            var toHash = options.toHash;
            var toView = options.toView;

            //如果明确指定为 null，则清空之前的。
            //否则，合并覆盖。
            if (hash$view === null) {
                router.hash$view = {};
            }
            else {
                Object.assign(router.hash$view, hash$view);
            }

            if (view$hash === null) {
                router.view$hash = {};
            }
            else {
                Object.assign(router.view$hash, view$hash);
            }
            

            if (typeof toHash == 'function') {
                router.view2hash = toHash;
            }

            if (typeof toView == 'function') {
                router.hash2view = toView;
            }

        },

        /**
        * 跳转到新视图，并传递一些参数。
        * @return {Object} 返回目标视图信息。
        */
        to: function (view, ...args) {
            if (typeof view != 'string') {
                throw new Error('参数 name 必须为 string 类型。');
            }


            var meta = mapper.get(this);
            var emitter = meta.emitter;
            var current = meta.hash$info[meta.hash]; //跳转之前，原来的 hash 对应的视图信息。
            var target = meta.setInfo(view, args);


            //已禁用。
            if (!meta.enabled) {
                return target;
            }

            
            if (target.hash != meta.hash) {
                meta.fireEvent = false;
                Hash.set(meta, target.hash);
            }


            if (current) {
                emitter.fire('to', [current.view, view, {
                    'cache': false,
                    'current': current,
                    'target': target,
                }]);
            }

            //此处的 target 必不为空。
            emitter.fire('view', [view, args, {
                'cache': false,
                'current': current,
                'target': target,
            }]);

            if (current) {
                emitter.fire('forward', [current.view, view]);
            }

            return target;

        },

        /**
        * 后退。
        */
        back: function (fireEvent) {
            var meta = mapper.get(this);
            meta.fireEvent = fireEvent === undefined ? true : !!fireEvent;

            history.back();
        },

        /**
        * 清空缓存和地址栏中的 hash。
        */
        clear: function () {
            var meta = mapper.get(this);

            if (meta.storage) {
                meta.storage.clear();
            }

            meta.fireEvent = false;
            meta.hash$info = {};
            Hash.set(meta, '');
          
        },

        /**
        * 设置启用或禁用。
        */
        enable: function (enabled) {
            var meta = mapper.get(this);
            meta.enabled = !!enabled;
        },

        /**
        * 绑定事件。
        */
        on: function (...args) {
            var meta = mapper.get(this);
            meta.emitter.on(...args);
        },

    };


    //静态成员。
    
    Object.assign(Navigator, {

        /**
        * 提供一种常用的模拟传统多页面的路由转换器。
        * 设置 hash 与 view 的双向映射转换关系。
        * 如 `AccountUsers` <-> `/account-users.html`。
        */
        simulate: {
            //把 view 转成 hash。
            toHash: function (view) {
                if (!view) {
                    return view;
                }

                view = $String.toHyphenate(view);   // `AccountUsers` -> `-account-users`。
                view = view.slice(1);               //`-account-users` -> `account-users`。
                view = `/${view}.html`;             //`account-users` -> `/account-users.html`。

                return view;
            },

            //把 hash 转成 view。
            toView: function (hash) {
                //确保如 `/xx.html` 的格式。
                if (!(/^\/.+\.html$/).test(hash)) {
                    return hash;
                }

                hash = hash.slice(1, -5);
                hash = $String.toCamelCase(hash);
                hash = hash[0].toUpperCase() + hash.slice(1);

                return hash;
            },
        },

    });

    return Navigator;


});


