/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-27 11:22:32
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-27 14:09:32
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
console.log('[Nacos] 注册Nacos服务',);
(async () => {
  const allinstance = await client.getAllInstances()
  console.log('[Nacos]----allinstance----', allinstance)
});
(async () => {
  try {
    await client.ready();
    // 注册服务和实例
    await client.registerInstance(providerServiceName, {
      ip: ipAddr,
      port
    });
    // 这里也可以传入group，不传默认就是 DEFAULT_GROUP
    // const groupName = 'nodejs';
    // await client.registerInstance(providerServiceName, {
    // ip: ipAddr,
    // port
    // }, groupName);
    console.log(`[Nacos] Nacos服务注册成功: ${ipAddr}:${port}`);
  } catch (err) {
    console.log('[Nacos] Nacos服务注册失败: ' + err.toString());
  }
})();

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