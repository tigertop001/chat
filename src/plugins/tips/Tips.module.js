import Tips from './Tips.view'

const TIPS = {
    duration: 2000, // 显示的时间 ms
    animateTime: 200, // 动画时间,表示这个组件切换show的动画时间
    install(Vue) {
        if (typeof window !== 'undefined' && window.Vue) {
            Vue = window.Vue
        }
        Vue.component('Tips', Tips)

        function msg(type, text, callBack) {
            let msg
            let duration = TIPS.duration
            if (typeof text === 'string') {
                msg = text
            } else if (text instanceof Object) {
                msg = text.text || ''
                if (text.duration) {
                    duration = text.duration
                }
            }
            // 创建vue对象
            let VueTips = Vue.extend({
                render(h) {
                    let props = {
                        type,
                        text: msg,
                        show: this.show
                    }
                    return h('tips', { props })
                },
                data() {
                    return {
                        show: false
                    }
                }
            })
            // 实例化
            let newTips = new VueTips()
            let vm = newTips.$mount()
            let el = vm.$el
            // 挂载
            let tipsTpl = document.getElementById("tips");
            if (tipsTpl) {
                document.body.removeChild(tipsTpl)
            }
            document.body.appendChild(el) // 把生成的提示的dom插入body中
            // document.body.appendChild(el) // 把生成的提示的dom插入body中

            vm.show = true
            let t1 = setTimeout(() => {
                clearTimeout(t1)
                vm.show = false //隐藏提示组件，此时会有300ms的动画效果，等动画效果过了再从body中移除dom
                let t2 = setTimeout(() => {
                    clearTimeout(t2)
                    let tipsTpl = document.getElementById("tips");
                    if (tipsTpl) {
                        document.body.removeChild(tipsTpl)
                    }
                    // document.body.removeChild(el) //从body中移除dom
                    // 销毁实例
                    newTips.$destroy()
                    vm = null // 设置为null，好让js垃圾回收算法回收，释放内存

                    callBack && (typeof callBack === 'function') && callBack()
                    // 如果有回调函数就执行，没有就不执行，用&&操作符，
                    // 只有&&左边 的代码为true才执行&&右边的代码，避免用面条代码：
                    // if(true){
                    //   ...
                    //   if(true){
                    //   ...
                    //   }
                    // }
                }, TIPS.animateTime)
            }, duration)
        }

        // 挂载到vue原型上，暴露四个方法
        Vue.prototype.$tips = {
            info(text, callBack) {
                if (!text) return
                msg('info', text, callBack)
            },
            success(text, callBack) {
                if (!text) return
                msg('success', text, callBack)
            },
            error(text, callBack) {
                if (!text) return
                msg('error', text, callBack)
            },
            warning(text, callBack) {
                if (!text) return
                msg('warning', text, callBack)
            },
            toast(text, callBack) {
                if (!text) return
                msg('toast', text, callBack)
            }
        },

        this.info = function(text, callBack) {
            if (!text) return
            msg('info', text, callBack)
        }
        this.success = function(text, callBack) {
            if (!text) return
            msg('success', text, callBack)
        }
        this.error = function(text, callBack) {
            if (!text) return
            msg('error', text, callBack)
        }
        this.warning = function(text, callBack) {
            if (!text) return
            msg('warning', text, callBack)
        }
        this.toast = function(text, callBack) {
            if (!text) return
            msg('toast', text, callBack)
        }
    }
}
export default TIPS


// export function Tips() { // js调用方法
//     var temp = '<div class="tips-status">' +
//                     '<div class="tips-content">' +
//                         '<div class="c1"></div><div class="c2"></div>' +
//                         '<div class="c3"></div><div class="c4"></div>' +
//                     '</div><span>loading</span>' +
//                 '</div>' +
//                 '<div class="bg"></div>'
//     var div = document.createElement("div");
//         div.id = 'loading-status';
//         div.innerHTML = temp;
//         document.body.appendChild(div)
// }

// export function tipsInfo() {
//     if(document.getElementById('loading-status')) {
//         document.body.removeChild(document.getElementById('loading-status'));
//     }
// }
