/*
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-20 15:31:00
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-01 15:46:13
 */
const express = require('express');
const proxy = require('http-proxy-middleware');
// webpack打包好gzip文件
const expressStaticGzip = require('express-static-gzip');
const app = express();

// nacos相关
const { NacosNamingClient, } = require('nacos');
const { address } = require('ip');
// 动态获取本机 IP 地址
const ipAddr = address();
// 我们当前app1应用的端口号
const port = 9900
const logger = console
// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'edsp-component-app1';
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572';
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'edsp-domain';

app.use(
  expressStaticGzip('../', {
    maxAge: '3d',
    setHeaders: setCustomCacheControl,
  })
);

function setCustomCacheControl (res, currentFilePath, stat) {
  if (currentFilePath.match(/\index\.html$/)) {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'no-cache');
  }
}

app.use(express.static('../output'));



app.listen(9900, (req, res) => {
  console.log('启动成功:', 'localhost:9900');
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
        componentName: 'vue-app1',
        address: `${ipAddr}:${port}/app1.js`
      }
    });
    // 这里也可以传入group，不传默认就是 DEFAULT_GROUP
    // const groupName = 'nodejs';
    // await client.registerInstance(providerServiceName, {
    // ip: ipAddr,
    // port
    // }, groupName);
    console.log(`[Nacos] Nacos服务实例注册成功: ${ipAddr}:${port}`);
  } catch (err) {
    console.log('[Nacos] Nacos服务实例注册失败: ' + err.toString());
  }
})();


// 监听远程nacos配置变化
client.subscribe({ serviceName: providerServiceName }, content => {
  console.log('[Nacos] 监听远程nacos配置:', content);
});

// 获取所有实例
(async () => {
  // const allinstance = await client.getAllInstances()
  const allinstance = await client.getAllInstances(providerServiceName, 'DEFAULT_GROUP', 'DEFAULT')
  console.log('[Nacos]----所有实例----', allinstance)
})();