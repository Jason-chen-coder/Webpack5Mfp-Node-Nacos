/*
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-20 15:31:00
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-06 10:30:15
 */
const express = require('express');
const app = express();
// nacos
const { NacosNamingClient } = require('nacos');
const { address } = require('ip');
// 动态获取本机 IP 地址
const ipAddr = address();
// 我们当前app1应用的端口号
const port = 9901
const logger = console
// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'edsp-component-app1';
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572';
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'edsp-domain';

app.use(express.static('../deploy'));


app.listen(port, () => {
  console.log(`-------------App2 服务启动成功-------------`);
  console.log(`- Local : http://localhost:${port} `);
  console.log(`- NetWork: http://${ipAddr}:${port} `);
  console.log(`-------------------------------------------`);
});


// 注册服务到Nacos服务器
const client = new NacosNamingClient({
  logger,
  serverList: nacosServerAddress,
  namespace: providerNamespase,
});

(async () => {
  try {
    await client.ready();
    // 注册服务和实例
    await client.registerInstance(providerServiceName, {
      ip: ipAddr,
      port,
      metadata: {
        componentName: 'vue-app2',
        address: `${ipAddr}:${port}/app2.js`
      }
    });
    // 这里也可以传入group，不传默认就是 DEFAULT_GROUP
    // const groupName = 'nodejs';
    // await client.registerInstance(providerServiceName, {
    // ip: ipAddr,
    // port
    // }, groupName);
    console.log(`[Nacos] Nacos服务实例注册成功: ${ipAddr}: ${port}`);
  } catch (err) {
    console.log('[Nacos] Nacos服务实例注册失败: ' + err.toString());
  }
})();

// // 监听远程nacos配置变化
// client.subscribe({ serviceName: providerServiceName }, content => {
//   console.log('[Nacos] 监听远程nacos配置:', content);
// });