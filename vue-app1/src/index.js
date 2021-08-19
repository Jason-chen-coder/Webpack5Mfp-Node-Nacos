/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:11:37
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-08-18 15:19:09
 */
import addCount from './untils/count'
addCount(1, 2);
import App from './App.vue'
import Vue from 'vue';

new Vue({
  render: h => h(App)
}).$mount('#app')