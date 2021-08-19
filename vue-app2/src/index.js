/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:20:44
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-08-18 16:21:12
 */
import addCount from './untils'
addCount(3, 4);
import Vue from 'vue'
import App from './App.vue'
new Vue({
  render: h => h(App)
}).$mount('#app')

// 联邦调用
//调用app1的模块
import('mfpVueAppOne/untils').then(res => {
  res.default(31, 2)
})

