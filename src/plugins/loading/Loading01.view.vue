<template lang="pug">
  div#loadEffect
    .loader.JS_on.load-effect-wrap
      span.binary
      span.binary
      text(x="14" y="21" font-family="Monaco" font-size="2px" style="letter-spacing:0.6" fill="grey")
        animate(attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite")
      span.getting-there LOADING
    .bg
</template>
<script>
export default {
  name: "myloading",
  props: {
    text: {
      type: String,
      default: ""
    },
    icon: {
      type: String
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    addClass() {
      if (this.icon == "warning" || this.icon == "close") return true;
      return false;
    }
  },
  data() {
    return {
      loading: true
    };
  },
  methods: {
    judgeClass() {
      let str = "";
      if (this.icon == "loading") {
        str += "home-loading-rotate";
      }
      if (this.icon == "success" && this.text) {
        str += "load-scs";
      }
      if (!!this.text) {
        str += " load-mr15";
      }
      return str;
    }
  }
};
</script>

<style scoped lang="stylus">
.loader 
  width 130px
  height 170px
  position: fixed
  left 50%
  top: 45%
  transform translate(-50%, -50%)
  z-index 10002
  // background: rgba(black, 0.2); // testing
  
  &::before, &::after 
    content: "";
    width: 0; 
    height: 0; 
    position: absolute;
    bottom: 30px;
    left: 15px;
    z-index: 1;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    // border-bottom: 20px solid darken(#2D4654, 10%);
    transform: scale(0);
    transition: all 0.2s ease;
  
  &::after 
    // border-right: 15px solid transparent;
    border-bottom: 20px solid darken(#FA967A, 13%);
  
  
  .getting-there
    width: 120%;
    text-align: center;
    position: absolute;
    bottom: 0;
    left: -7%;
    font-family: "Lato";
    font-size: 12px;
    letter-spacing: 2px;
    color: #ffecbc;
    animation: loader 1s cubic-bezier(0.5, 0.1, 0.15, 1) alternate infinite;
  
  
  .binary 
    width: 100%;
    height: 140px;
    display: block;
    color: #ffecbc;
    position: absolute;
    top: 0;
    z-index: 2;
    overflow: hidden;
    
    &::before, &::after 
      font-family: "Lato";
      font-size: 24px;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
    
    
    &:nth-child(1) 
      &::before 
        content: "0";
        animation: a 1.1s linear infinite;
      
      &::after 
        content: "0";
        animation: b 1.3s linear infinite;
      
    
    &:nth-child(2) 
      &::before 
        content: "1";
        animation: c 0.9s linear infinite;
      
      &::after 
        content: "1";
        animation: d 0.7s linear infinite;
      
    
  
  
  // ACTIVATE
  &.JS_on 
    &::before, &::after 
      transform: scale(1);

@keyframes a 
  0% 
    transform: translate(30px, 0) rotate(30deg);
    opacity: 0;
    
  100% 
    transform: translate(30px, 150px) rotate(-50deg);
    opacity: 1;
    

@keyframes b 
  0% 
    transform: translate(50px, 0) rotate(-40deg);
    opacity: 0;
  
  100% 
    transform: translate(40px, 150px) rotate(80deg);
    opacity: 1;
    

@keyframes c 
  0% 
    transform: translate(70px, 0) rotate(10deg);
    opacity: 0;
  
  100% 
    transform: translate(60px, 150px) rotate(70deg);
    opacity: 1;
    

@keyframes d 
  0% 
    transform: translate(30px, 0) rotate(-50deg);
    opacity: 0;
  100% 
    transform: translate(45px, 150px) rotate(30deg);
    opacity: 1;


@keyframes loader
  0%
    letter-spacing: -1px;
  100%
    letter-spacing: 15px;

</style>