<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-07 10:57:13
-->
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App1</h1>
    <div>
      引入国际化: <b>i18n:{{ $t("home1.lang1") }}</b>
    </div>
    <div>引入图片:<img src="./assets/images/webpackimage.png" alt="" /></div>
    <div>引入字体图标(CSS):<span class="iconfont icon-zuhe"></span></div>
    <div>
      引入字体图标(JS):
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-dulitixi-copy-copy-copy-copy-copy"></use>
      </svg>
    </div>
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
<style>
.vue-app1 {
  border: black solid 1px;
  padding: 10px;
}
</style>