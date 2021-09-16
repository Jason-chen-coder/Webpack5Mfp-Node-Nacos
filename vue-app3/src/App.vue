<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-16 15:38:35
-->
<template>
  <div class="vue-app3">
    <h1>这里是Vue-App3</h1>
    <div class="mfp-area">
      <div class="app1-area">
        <div class="title">app1-from-nacos:</div>
        <div class="app1-box"><appOneChildren /></div>
      </div>
      <div class="app2-area">
        <div class="title">app2-from-nacos:</div>
        <div class="app2-box"><appTwoChildren /></div>
      </div>
    </div>
  </div>
</template>
<script>
import { loadRemoteComponent, getComponentInfo } from './untils/index.js'
export default {
  components: {
    appTwoChildren: (async () => {
      let serAdd = '';
      try {
        let app2Info = await getComponentInfo('app2')
        serAdd = `http://${app2Info.metadata.address}`
      } catch {
        serAdd = `./mfpApps/app2/deploy/app2.js`
      }
      const app2 = await loadRemoteComponent({
        url: serAdd,
        scope: 'vueAppTwo',
        module: './appTwoChildren'
      })
      return app2
    }),
    appOneChildren: (async () => {
      let serAdd = '';
      try {
        let app1Info = await getComponentInfo('app1')
        serAdd = `http://${app1Info.metadata.address}`;
      } catch {
        serAdd = `./mfpApps/app1/deploy/app1.js`
      }
      const app1 = await loadRemoteComponent({
        url: serAdd,
        scope: 'vueAppOne',
        module: './appOneChildren'
      })
      // 加载iconfont
      await loadRemoteComponent({
        url: serAdd,
        scope: 'vueAppOne',
        module: './appOneIconfont'
      })
      return app1
    })
  },
};
</script>
<style lang="less">
.vue-app3 {
  text-align: center;
}
.mfp-area {
  display: flex;
  justify-content: space-evenly;
  height: 1000px;
}
.app1-area,
.app2-area {
  border: 1px solid black;
  width: 40%;
}
.app1-box,
.app2-box {
  height: 98%;
}
.title {
  height: 2%;
}
</style>