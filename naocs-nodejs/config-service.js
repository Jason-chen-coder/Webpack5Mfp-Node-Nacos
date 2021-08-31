/*
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-27 10:05:04
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-27 17:05:22
 */
// 注册配置,获取配置
const NacosConfigClient = require('nacos').NacosConfigClient;
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572';
// namespace: 名称空间必须在服务器上存在
const providerNamespase = 'edsp-domain';
// 名称空间下的Group
const group = 'DEFAULT_GROUP'
// 命名空间下的Data Id
const dataId = 'test1'
// for direct mode
const configClient = new NacosConfigClient({
  serverAddr: nacosServerAddress,
  namespace: providerNamespase,
});

// 获取nacos配置
(async () => {
  const content1 = await configClient.getConfig(dataId, group);
  console.log('[Nacos] 获取配置： ', content1);

})();

// 监听远程nacos配置变化
configClient.subscribe({
  dataId: dataId,
  group: group,
}, content => {
  console.log('[Nacos] 监听远程nacos配置:', content);
});

// 发布配置
(async () => {
  const content2 = await configClient.publishSingle(dataId, group, 'publishSingle测试');
  content2 && console.log('[Nacos] 发布配置成功');
})();

// 移除配置
// (async () => {
//   const content3 = await configClient.remove(dataId, group);
//   content3 && console.log('[Nacos] 移除配置成功');
// })()