<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-03 17:44:34
-->
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App1</h1>
    <div>
      引入国际化: <b>i18n:{{ $t("home1.lang1") }}</b>
    </div>
    <div>引入图片:<img src="./assets/images/webpackimage.png" alt="" /></div>
    <div>引入字体图标:<span class="iconfont icon-zuhe"></span></div>
    <div style="display: flex"><span>子组件:</span><children></children></div>
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
  background-image: url(./assets/images/ModuleFederationPlugin.jpg);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
</style>