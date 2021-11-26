<template lang="pug">
  svg(:class="svgClass" aria-hidden="true" v-on="$listeners")
    use(:xlink:href="iconName")
</template>
 
<script>
  export default {
    name: 'svgIcon', // SVG图标引用组件
    props: {
      iconClass: {
        type: String,
        required: true
      },
      className: {
        type: String,
        default: ''
      }
    },
    computed: {
      iconName() {
        return `#icon-${this.iconClass}`
      },
      svgClass() {
        if (this.className) {
          return 'svg-icon ' + this.className
        } else {
          return 'svg-icon'
        }
      }
    }
  }
</script>
 
<style scoped lang="stylus">
  .svg-icon 
    width: 1em
    height: 1em
    vertical-align: -0.15em
    fill: currentColor
    overflow: hidden
</style>