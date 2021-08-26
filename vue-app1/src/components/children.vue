<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:36:52
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-23 17:04:44
-->
<template>
  <div class="app1-children">App1-children-component</div>
</template>

<script>
export default {
  name: 'appOneChildren',
  beforeCreate () {
    console.log('children-beforeCreate')
  },
  created () {
    console.log('children-created')
  },
  beforeMount () {
    console.log('children-beforeMount')
  },
  mounted () {
    console.log('children-mounted')
  },
  beforeUpdate () {
    console.log('children-beforeUpdate')
  },
  updated () {
    console.log('children-updated')
  },
  beforeDestroy () {
    console.log('children-beforeDestroy')
  },
  destroyed () {
    console.log('children-destroyed')
  },
}
</script>

<style lang="less">
.app1-children {
  border: 1px solid red;
  background: red;
  color: #ffff;
}
</style>
