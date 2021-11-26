<template>
  <div id="loading-dialog">
    <div class="content-box" :class="dialProp.leftIcon == 'success' ? 'load-success' : ''" v-show="dialProp.content">
      <!-- <span class="d-close" v-show="dialProp.leftIcon">
        <svg-icon v-if="dialProp.leftIcon" :icon-class="dialProp.leftIcon" :class="dialProp.leftIcon == 'loading' ? 'load-circle' : ''"/>
      </span> -->
      <div class="d-close" v-show="dialProp.leftIcon">
        <div class="spinner">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
        </div>
      </div>
      <div class="hd-c" v-show="dialProp.content != '0'">{{dialProp.content}}</div>
    </div>
    <div :class="getBgClass(dialProp.content)"></div>
  </div>
</template>
<script>
export default {
  name: 'Dialog', // 对话框
  props: {
    dialProp: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  methods: {
    getBgClass(v) {
    let getBg = document.getElementsByClassName("bg");
      let bg = 'bgw'
      if (getBg.length != 0 || !v){
        bg ='bgw';
      }
      return bg;
    }
  }
  }
</script>

<style lang="stylus" scoped>
#loading-dialog 
  .bgw
    background: rgba(0,0,0,0)
    left: 0
    top: 0
    filter: "Alpha(opacity=60)"
    opacity: 0.8
    display: block
    width: 100%
    position: fixed
    top: 0
    z-index: 10001
    width: 100%
    height: 100%
  .d-close
    display flex
    align-items center
  .hd-c
    padding-right: 10px
    font-size 16px
    display flex
    align-items center
  .content-box
    position: fixed
    left: 50%
    top: 50%
    transform: translate(-50%, -50%)
    border-radius: 6px
    z-index: 20100
    background-color: rgba(0, 0, 0, 0.6)
    display: flex
    padding: 20px 10px
    color: #ffffff
    line-height: 26px
    max-width: 80vw;
    span
      display: flex
      margin: 0 10px
      font-size 16px
      .svg-icon
        font-size: 26px
        margin: auto
    .load-circle
      -webkit-animation:myRotate 1s linear infinite
      animation:myRotate 1s linear infinite
    div
      white-space:nowrap;
  .load-success
    color: #1ad2f1
@keyframes myRotate 
  0% 
    transform: rotate(0deg)
  100% 
    transform: rotate(360deg)

.spinner-wrap {
    margin: auto;
    zoom 0.3
    transform:scale(0.3);
    width 90px
    position: absolute;
    top -21px
}

.load-f{
    width:100%
    text-align center
    color #ffffff
    position: absolute;
    bottom 12px
}
.spinner {
    height: 100px;
    width: 100px;
    display: inline-block;
    animation: spin 1s steps(12, end) infinite;
    zoom 0.3
    transform:scale(0.3);
}
.spinner:first-child {
    margin-right: 50px;
}
.spinner i {
    height: 20px;
    width: 6px;
    margin-left: -3px;
    display: block;
    transition: height 1s;
    position: absolute;
    left: 50%;
    transform-origin: center 50px;
    background: #ffffff;
    box-shadow: 0 0 3px rgba(255, 255, 255, 1);
    border-radius: 3px;
}
.spinner:nth-child(2) i {
    height: 6px;
}
.spinner:hover i {
    height: 6px;
}
.spinner:hover:nth-child(2) i {
    height: 30px;
}

.spinner i:nth-child(1) {
    opacity: 0.08;
}

.spinner i:nth-child(2) {
    transform: rotate(30deg);
    opacity: 0.167;
}

.spinner i:nth-child(3) {
    transform: rotate(60deg);
    opacity: 0.25;
}

.spinner i:nth-child(4) {
    transform: rotate(90deg);
    opacity: 0.33;
}

.spinner i:nth-child(5) {
    transform: rotate(120deg);
    opacity: 0.4167;
}

.spinner i:nth-child(6) {
    transform: rotate(150deg);
    opacity: 0.5;
}

.spinner i:nth-child(7) {
    transform: rotate(180deg);
    opacity: 0.583;
}

.spinner i:nth-child(8) {
    transform: rotate(210deg);
    opacity: 0.67;
}

.spinner i:nth-child(9) {
    transform: rotate(240deg);
    opacity: 0.75;
}

.spinner i:nth-child(10) {
    transform: rotate(270deg);
    opacity: 0.833;
}

.spinner i:nth-child(11) { transform: rotate(300deg);
    opacity: 0.9167;
}

.spinner i:nth-child(12) {
    transform: rotate(330deg);
    opacity: 1;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
} 
</style>