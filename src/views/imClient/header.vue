<template lang="pug">
  header.c-header
    .h-icon
      //- svg-icon(icon-class='back')
      .svg-hicon 
    .h-font 当前客服
</template>
<script>
export default {
    name:"Header", // 头部
    competed: {
    },
    created() {
    },
    methods: {
    }
}

</script>

<style scoped lang="stylus">
 .c-header
  height 44px
  background-color #ffffff
  width 100%
  display flex
  justify-content: space-between
  align-items: center
.h-icon
  width 44px
  text-align: center
.svg-hicon
  width 40px
  height 40px
  background-image url("~@/assets/icons/back.png")
  background-size 20px 20px
  background-position center center
  background-repeat no-repeat
.h-font
  padding-right 40px
  text-align: center
  width 100%
  font-size 21px
  color: #4d4d4d
</style>