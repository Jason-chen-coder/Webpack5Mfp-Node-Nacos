/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-24 10:11:14
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-25 11:12:24
 */
import VueI18n from "vue-i18n";
import zh from './zh/index'
import en from './en/index'
import Vue from 'vue'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: "zh",
  messages: {
    zh, en
  }
})
export { i18n, zh, en };