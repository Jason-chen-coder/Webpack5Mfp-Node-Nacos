/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:11:37
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-16 15:20:54
 */
import { i18n } from './language/index'
import { loadRemoteComponent, getComponentInfo } from './untils/index.js'
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
  let langObj
  try {
    let app1Info = await getComponentInfo('app1', true)
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