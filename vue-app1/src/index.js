/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:11:37
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-06 14:29:26
 */
import addCount from './untils/count'
import { i18n } from './language/index'
import VueI18n from 'vue-i18n'
import './assets/iconfont/iconfont.css'
import './assets/iconfont/iconfont.js'


Vue.use(VueI18n)
addCount(1, 2);
import App from './App.vue'
import Vue from 'vue';

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')