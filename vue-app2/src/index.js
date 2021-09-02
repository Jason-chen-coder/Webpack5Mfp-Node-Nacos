/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:20:44
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-02 11:39:06
 */
import { i18n } from './language/index'
// import('mfpVueAppOne/applang').then(res => {
//   i18n.mergeLocaleMessage('en', res.en)
//   i18n.mergeLocaleMessage('zh', res.zh)
// })
// import { loadRemoteComponent } from './untils/index.js'
import Vue from 'vue'
import App from './App.vue'
// (async () => {
//   const res = await loadRemoteComponent({
//     url: './output/app1.js',
//     scope: 'vueAppOne',
//     module: './applang'
//   })
//   i18n.mergeLocaleMessage('en', res.en)
//   i18n.mergeLocaleMessage('zh', res.zh)
// })()

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')

