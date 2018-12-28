/**
* API 模块的默认配置
* @name API.defaults
*/
define('API.defaults', /**@lends API.defaults*/ {
    /**
    * 成功的状态码。 
    * 只有状态码为该值是才表示成功，其它的均表示失败。
    */
    successCode: 200,

    /**
    * 字段映射。
    */
    field: {
        /**
        * 状态码。
        */
        code: 'code',
        /**
        * 消息。
        */
        msg: 'msg',
        /**
        * 主体数据。
        */
        data: 'data',
    },

    /**
    * 代理配置。
    */
    proxy: null,

    /**
    * 随机延迟时间，更真实模拟实际网络环境。
    * 可指定为 false，或如 { min: 500, max: 2000 } 的格式。
    */
    delay: false,

    /**
    * 在 url 中增加一个随机 key，以解决缓存问题。
    * 当指定为 false 时，则禁用。
    */
    random: true,

    /**
    * API 接口 Url 的主体部分。
    */
    url: '',

    /**
    * API 接口 Url 的前缀部分。
    */
    prefix: '',

    /**
    * API 接口 Url 的后缀部分。
    * 针对那些如 '.do'、'.aspx' 等有后缀名的接口比较实用。
    */
    ext: '',

    /**
    * 要发送的数据。 可选的。
    * 当发送方式为 get 时，该数据将会给序列化成查询字符串并附加到 url 查询参数中。
    * 当发送方式为 post 时，会用在表单中。
    */
    data: null,

    /**
    * 要发送的查询参数，仅当发送方式为 post 时有效 (可选的)。
    * 当发送方式为 post 时，该数据将会给序列化成查询字符串并附加到 url 查询参数中。
    */
    query: null,

    /**
    * 请求超时的最大值(毫秒)。
    * 0 表示由浏览器控制，代码层面不控制。
    */
    timeout: 0,


    /**
    * 把请求时的 data 中的第一级子对象进行序列化的方法。
    * @param {string} key 要进行处理的子对象的键。
    * @param {Object} value 要进行处理的子对象的值对象。
    * @return {string} 返回该子对象序列化的字符串。
    */
    serialize: function (key, value) {
        var json = JSON.stringify(value);
        return encodeURIComponent(json);
    },

    /**
    * 用于发起 ajax 请求的 get 方法。
    * 如果想实现自己的 get 方法，可以提供此函数。
    * 否则使用内部默认的 Ajax.get() 方法。
    */
    get: null,

    /**
    * 用于发起 ajax 请求的 post 方法。
    * 如果想实现自己的 post 方法，可以提供此函数。
    * 否则使用内部默认的 Ajax.post() 方法。
    */
    post: null,

});

