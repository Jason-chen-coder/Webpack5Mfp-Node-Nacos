/*
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-24 09:48:29
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-24 10:22:58
 */
import VueI18n from 'vue-i18n'
import Vue from 'vue'
Vue.use(VueI18n)
import zh from './zh/index'
import en from './en/index'
const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    zh,
    en
  }
})
export { i18n, zh, en }