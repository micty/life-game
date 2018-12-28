
/**
* 简单的下拉刷新。
*/
define('Scroller/Pulldown', function (require, module,  exports) {
    var Indicator = module.require('Indicator');
    var Loading = module.require('Loading');




    return {
        bind: function (meta) {
            var pulldown = meta.pulldown;

            if (!pulldown.load || pulldown.binded) {
                return;
            }


            var indicator = Indicator.create({
                'container': meta.container,
                'top': pulldown.top,
            });

            var loading = Loading.create({
                'container': meta.container,
                'top': pulldown.top,
            });

            var isLoading = false;


            pulldown.binded = true;


            //上拉时，把下拉的提示隐藏。
            meta.this.on('pullup', {
                'start': function () {
                    isLoading = false;
                    indicator.hide();
                    meta.this.reset();
                },
            });


            meta.this.on('pulldown', {
                'start': function () {
                    indicator.hide();
                },

                'enter': function () {
                    loading.hide();

                    indicator.$.html('下拉刷新');
                    indicator.show();
                },

                'reach': function () {
                    loading.hide();
                    indicator.$.html('释放立即刷新');
                },

                'release': function () {
                    this.to(pulldown.release);

                    indicator.hide();
                    loading.show();

                    if (isLoading) {
                        return;
                    }


                    isLoading = true;

                    //回调函数作为 done，传给使用者，必须显式调用一次以通知 load 结束。
                    pulldown.load(function () { 
                        loading.hide();

                        indicator.$.html('刷新成功');
                        indicator.show();

                        setTimeout(function () { //reset
                            isLoading = false;
                            indicator.hide();
                            meta.this.reset();

                        }, 500);
                    });
                },
            });


        },


    };




});


