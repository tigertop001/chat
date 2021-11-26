import MyLoading from "./Loading.view";

const MYLOADING = {
  install(Vue) {
    if (document.getElementsByClassName(".load-effect-wrap").length) return;
    if (typeof window !== "undefined" && window.Vue) {
      Vue = window.Vue;
    }
    Vue.component("myloading", MyLoading);
    function msg(type, text, duration, callBack) {
      let msg, icon;
      if (typeof text === "string") {
        msg = text;
      } else if (text instanceof Object) {
        msg = text.text || "";
        if (text.icon) {
          icon = text.icon;
        }
      }
      let VueLoading = Vue.extend({
        render(h) {
          let props = {
            text: msg,
            icon: icon
          };
          return h("myloading", { props });
        },
        data() {
          return {
            show: false
          };
        }
      });
      let newLaoding = new VueLoading();
      let vm = newLaoding.$mount();
      let el = vm.$el;
      if (type == "show") {
        let loadTpl = document.getElementById("loadEffect");
        if (loadTpl) {
          document.body.removeChild(loadTpl);
        }
        document.body.appendChild(el); // 把生成的提示的dom插入body中
        vm.show = true;
        if(duration) {
          let t1 = setTimeout(() => {
            clearTimeout(t1);
            hid();
            callBack && (typeof callBack === 'function') && callBack()
          }, duration)
        }
      }
      if (type == "hidden") {
        hid();
      }

      function hid() {
        newLaoding.$destroy();
        vm = null; // 设置为null，好让js垃圾回收算法回收，释放内存
        let loadTpl = document.getElementById("loadEffect");
        if (!loadTpl) return;
        return document.body.removeChild(loadTpl);
      }
    }

    Vue.prototype.$myloading = (type, text, duration, callBack) => {
      msg(type, text, duration, callBack);
    };

    this.show = (text, duration, callBack) => {
      msg('show', text, duration, callBack);
    };
    this.hidden = (text, duration, callBack) => {
      msg('hidden', text, duration, callBack);
    };


  }
};
export default MYLOADING;
