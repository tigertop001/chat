<template lang="pug">
  transition(name="fade")
    .tips#tips
      .tpf(:class="type" v-show="show") {{text}}
</template>

<script type="text/ecmascript-6">
export default {
  name: 'tips',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: val => ['info', 'success', 'warning', 'error'].includes(val)
    },
  text: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: false
  }
 },
 methods: {
   getIcon(t) {
     if(t =='error') {
       return 'close'
     }else{
       return t
     }
   }
 }
}
</script>
<style scoped lang="stylus">
.fade-enter-active,.fade-leave-active
  transition: opacity 0.5s
.fade-enter,.fade-leave-to
  opacity: 0
.tips
  width 100%
  height 100vh
  background-color rgba(0,0,0,0,0)
  z-index 100
  position fixed
  bottom 0
  display flex
  justify-content center
  align-items center
.tpf
  color: #ffffff
  background: rgba(0, 0, 0, 0.6)
  font-size: 16px
  border-radius: 4px
  z-index: 100000
  box-shadow: 0 0 10px rgba(0, 0, 0, .3)
  width: 300px
  height: 55px
  -webkit-overflow-scrolling: touch
  display: flex
  justify-content: center
  align-items: center
  flex-wrap: wrap
  padding 5px 15px
  z-index 2
// .tbg
//   position fixed
//   z-index 1
//   background-color #ffff00
//   width 100%
//   height 100%
</style>
