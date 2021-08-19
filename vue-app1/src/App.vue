<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-08-19 13:31:17
-->
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App1.vue</h1>
    <children></children>
  </div>
</template>
<script>
import children from './components/children.vue'
export default {
  components: {
    children,
  }
}


 </script>
<style lang="less">
.vue-app1 {
  border: black solid 1px;
}
</style>