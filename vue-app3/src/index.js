/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:11:37
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-16 10:48:45
 */
import { i18n } from './language/index'
import { loadRemoteComponent } from './untils/index.js'
// require('./assets/iconfont/iconfont.css')
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
  let nacosInstancesList;
  let langObj
  try {
    let res = await fetch('/nacos/getAllInstances', {
      method: 'get'
    })
    nacosInstancesList = await res.json();
    let app1Info = nacosInstancesList.filter(item => item.metadata.componentName.includes('app1')).pop();
    langObj = await loadRemoteComponent({
      url: app1Info ? `http://${app1Info.metadata.address}` : '/mfpApps/app1/deploy/app1.js',
      scope: 'vueAppOne',
      module: './applang'
    })

  } catch {
    langObj = await loadRemoteComponent({
      url: '/mfpApps/app1/deploy/app1.js',
      scope: 'vueAppOne',
      module: './applang'
    })
  }
  i18n.mergeLocaleMessage('en', langObj.en)
  i18n.mergeLocaleMessage('zh', langObj.zh)

})()

new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')