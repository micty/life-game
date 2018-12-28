/**
* SSH/Server/Config 模块的默认配置
* @name SSH/Server/Config.defaults
*/
define('SSH/Server/Config.defaults', /**@lends SSH/Server/Config.defaults*/ {

    url: 'http://mob.cmcloud.cn/kisplus/kisplusconfig.aspx?callback=?',

    /**
    * 是否启用缓存。
    * 可取的值为 false|true|'session'|'local'
    */
    cache: 'session',

    //默认使用服务器返回的(为 `http://kd.cmcloud.cn`)。
    //如果显式指定了该值，则忽略服务器返回的。
    host: '',
     

});

