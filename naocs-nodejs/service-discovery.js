/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-27 11:22:32
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-31 14:05:56
 */
// 注册服务到Nacos服务器
const {
  NacosNamingClient,
} = require('nacos');

const {
  address,
} = require('ip');
const logger = console

// 动态获取本机 IP 地址
const ipAddr = address();
// 我们当前app1应用的端口号
const port = 3001

// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'edsp-component-app1';
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572';
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'edsp-domain';
const client = new NacosNamingClient({
  logger,
  serverList: nacosServerAddress,
  namespace: providerNamespase,
});

(async () => {
  const allInstances = await client.getAllInstances()
  console.log('[Nacos]----allInstances----', allInstances)
})();

(async () => {
  try {
    await client.ready();
    // 注册服务和实例
    await client.registerInstance(providerServiceName, {
      ip: ipAddr,
      port,
      metadata: {
        a: 1
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
client.subscribe(providerServiceName, content => {
  console.log('[Nacos] 监听远程nacos配置:', content);
});
// (async () => {
//   try {
//     await client.close();
//     await client.deregisterInstance(providerServiceName, {
//       ip: ipAddr,
//       port
//     });
//     logger.info(`[ssr-nacos] 注销成功: ${ipAddr}:${port}`);
//   } catch (err) {
//     logger.error('[ssr-nacos] 注销失败: ' + err.toString());
//   }
// })();