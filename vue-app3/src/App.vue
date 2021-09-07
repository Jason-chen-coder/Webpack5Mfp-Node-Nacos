<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-07 10:41:49
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
import { loadRemoteComponent, loadLink } from './untils/index.js'
export default {
  components: {
    appTwoChildren: (async () => {
      let nacosInstancesList;
      let serAdd = '';
      try {
        let res = await fetch('/nacos/getAllInstances', {
          method: 'get'
        })
        nacosInstancesList = await res.json();
        let app2Info = nacosInstancesList.filter(item => item.metadata.componentName.includes('app2')).pop();
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
      let nacosInstancesList;
      let serAdd = '';
      try {
        let res = await fetch('/nacos/getAllInstances', {
          method: 'get'
        })
        nacosInstancesList = await res.json();
        let app1Info = nacosInstancesList.filter(item => item.metadata.componentName.includes('app1')).pop();
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
      const iconjs = await loadRemoteComponent({
        url: serAdd,
        scope: 'vueAppOne',
        module: './appOneIconfont'
      })
      return app1
    })
  },
  mounted () {

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