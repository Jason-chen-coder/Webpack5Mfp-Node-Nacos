<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:45:39
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-25 17:58:45
-->
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App2.vue</h1>
    <children ref="children"></children><br />
    <appOneChildren></appOneChildren>
  </div>
</template>

<script>
import children from './component/children.vue'
import { loadRemoteComponent } from './untils/index.js'

export default {
  components: {
    children,
    // appOneChildren: () => import('mfpVueAppOne/appOneChildren')
    appOneChildren: (async () => {
      const app1 = await loadRemoteComponent({
        url: 'http://localhost:3001/app1.js',
        scope: 'vueAppOne',
        module: './appOneChildren'
      })
      return app1
    })
  },
  mounted () {
    this.$nextTick(() => {
      console.log(this.$refs)
      console.log(this)
    })
    import('mfpVueAppOne/cloneDeep').then((res) => {
      console.log('res', res.default({ 'a': 'aaaaa' }))
    })
  }
}
</script>

<style lang='less'>
.vue-app1 {
  border: solid 1px blue;
  padding: 10px;
}
</style>