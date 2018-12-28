
/**
* 针对标准模式的处理。
* 即命令行中【不】含有 `compat` 参数的命令。
* 主要完成的功能：
*   1，删除所有元数据 `data-meta` 属性里含有 `type="compat"` 的 `<script>` 标签。
*/



module.exports = function (require, website, defaults) {



    website.on('render', {
        /**
        * 渲染生成 `<script>` 标签时触发。
        * 此处完成：
        *   删除所有标注为 `type="compat"` 的 `<script>` 标签。
        */
        'js-link': function (file, html, data) {
            var item = data.item || {};
            var meta = item.meta || {};


            //显式指定为兼容模式的，则删除该 `<script>` 标签。
            //返回空字符串，表示删除内容。
            if (meta.type == 'compat') {
                return '';
            }
        },
    });

};
