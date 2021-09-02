<!--
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-18 15:09:23
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-02 11:39:24
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
import { loadRemoteComponent } from './untils/index.js'
export default {
  components: {
    appTwoChildren: (async () => {
      let res = await fetch('/nacos/getAllInstances', {
        method: 'get'
      })
      let nacosInstancesList = await res.json();
      let app2Info = nacosInstancesList.filter(item => item.metadata.componentName.includes('app2')).pop();
      const app2 = await loadRemoteComponent({
        url: `http://${app2Info.metadata.address}`,
        scope: 'vueAppTwo',
        module: './appTwoChildren'
      })
      return app2
    }),
    appOneChildren: (async () => {
      let res = await fetch('/nacos/getAllInstances', {
        method: 'get'
      })
      let nacosInstancesList = await res.json();
      let app1Info = nacosInstancesList.filter(item => item.metadata.componentName.includes('app1')).pop();
      console.log(app1Info.metadata.address, 'app1Info.metadata.address')
      const app1 = await loadRemoteComponent({
        url: `http://${app1Info.metadata.address}`,
        scope: 'vueAppOne',
        module: './appOneChildren'
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