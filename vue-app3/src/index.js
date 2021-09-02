/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:11:37
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-02 14:42:46
 */
import { i18n } from './language/index'
import { loadRemoteComponent } from './untils/index.js'

import App from './App.vue'
import Vue from 'vue';
// (async () => {
//   const res = await loadRemoteComponent({
//     url: './output/app1.js',
//     scope: 'vueAppOne',
//     module: './applang'
//   })
//   i18n.mergeLocaleMessage('en', res.en)
//   i18n.mergeLocaleMessage('zh', res.zh)
// })()
(async () => {
  let res = await fetch('/nacos/getAllInstances', {
    method: 'get'
  })
  let nacosInstancesList = await res.json();
  let app1Info = nacosInstancesList.filter(item => item.metadata.componentName.includes('app1')).pop();
  const { en, zh } = await loadRemoteComponent({
    url: `http://${app1Info.metadata.address}`,
    scope: 'vueAppOne',
    module: './applang'
  })
  i18n.mergeLocaleMessage('en', en)
  i18n.mergeLocaleMessage('zh', zh)
})()

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')