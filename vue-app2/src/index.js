/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:20:44
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-25 11:03:15
 */
import { i18n } from './language/index'
import('mfpVueAppOne/applang').then(res => {
  i18n.mergeLocaleMessage('en', res.en)
  i18n.mergeLocaleMessage('zh', res.zh)
})
import Vue from 'vue'
import App from './App.vue'
new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')

