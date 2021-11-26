<template lang="pug">
  div#loadEffect
    .load-wrap
      .loader
        .loader--dot
        .loader--dot
        .loader--dot
        .loader--dot
        .loader--dot
        .loader--dot
        .loader--text
    .bg
</template>
<script>
export default {
  name: "myloading"
};
</script>

<style scoped lang="stylus">
.load-wrap
  width 100vw
  height 100vw;
  position: fixed
  left 50%
  top: 45%
  transform translate(-50%, -50%)
  z-index 10002
  overflow hidden
.loader {
  height: 10px;
  width: 100px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  z-index 11
}
.loader--dot {
  animation-name: loader;
  animation-timing-function: ease-in-out;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  height: 10px;
  width: 10px;
  border-radius: 100%;
  background-color: black;
  position: absolute;
  // border: 2px solid white;
}
.loader--dot:first-child {
  background-color: #8cc759;
  animation-delay: 0.5s;
}
.loader--dot:nth-child(2) {
  background-color: #8c6daf;
  animation-delay: 0.4s;
}
.loader--dot:nth-child(3) {
  background-color: #ef5d74;
  animation-delay: 0.3s;
}
.loader--dot:nth-child(4) {
  background-color: #f9a74b;
  animation-delay: 0.2s;
}
.loader--dot:nth-child(5) {
  background-color: #60beeb;
  animation-delay: 0.1s;
}
.loader--dot:nth-child(6) {
  background-color: #fbef5a;
  animation-delay: 0s;
}
.loader--text {
  position: absolute;
  top: 200%;
  left: -20px;
  right: 0;
  width: 100px
  margin: auto;
  z-index 101
  text-align center
  color #eeeded
  font-size 10px
}
.loader--text:after {
  content: '\6b63\5728\52a0\8f7d\4e2d';
  animation-name: loading-text;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

@keyframes loader {
  15% {
    transform: translateX(0);
  }
  45% {
    transform: translateX(100px);
  }
  65% {
    transform: translateX(100px);
  }
  95% {
    transform: translateX(0);
  }
}
@keyframes loading-text {
  0% {
    content: "\6b63\5728\52a0\8f7d\4e2d";
  }
  25% {
    content: "\6b63\5728\52a0\8f7d\4e2d\002e";
  }
  50% {
    content: "\6b63\5728\52a0\8f7d\4e2d\002e\002e";
  }
  75% {
    content: "\6b63\5728\52a0\8f7d\4e2d\002e\002e\002e";
  }
}
</style>