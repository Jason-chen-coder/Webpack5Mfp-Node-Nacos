<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:45:39
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-08-19 13:38:35
-->
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App2.vue</h1>
    <children></children><br />
    <appOneChildren></appOneChildren>
  </div>
</template>

<script>
import children from './component/children.vue'

export default {
  components: {
    children,
    appOneChildren: () => import('mfpVueAppOne/appOneChildren')
  },
}
</script>

<style lang='less'>
.vue-app1 {
  border: solid 1px blue;
  padding: 10px;
}
</style>