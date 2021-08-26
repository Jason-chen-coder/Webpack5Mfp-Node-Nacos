<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-25 10:59:39
-->
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App1</h1>
    <div>i18n:{{ $t("home1.lang1") }}</div>
    <children></children>
  </div>
</template>
<script>
import children from './components/children.vue'
export default {
  components: {
    children,
  },
}


 </script>
<style lang="less">
.vue-app1 {
  border: black solid 1px;
}
</style>