/*
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-20 15:31:00
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-02 16:59:48
 */
const express = require('express');
const app = express();

// nacos相关
const { NacosNamingClient, } = require('nacos');
// 我们当前应用的端口号
const port = 9090
const logger = console
// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'edsp-component-app1';
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572';
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'edsp-domain';


app.use(express.static('../deploy'));


app.listen(port, () => {
  console.log(`启动成功:localhost:${port}`);
});

// 注册服务到Nacos服务器
const client = new NacosNamingClient({
  logger,
  serverList: nacosServerAddress,
  namespace: providerNamespase,
});

app.get('/nacos/getAllInstances', async (req, res) => {
  let allInstances = await client.getAllInstances(providerServiceName, 'DEFAULT_GROUP', 'DEFAULT', false)
  res.send(allInstances);
});
/*
 *getAllInstances获取所有实例
 *serviceName 服务名称
 *groupName 组名
 *clasters 集群名
 *subscribe 是否开启订阅
 */
// (async () => {
//   let allInstances = await client.getAllInstances(providerServiceName, 'DEFAULT_GROUP', 'DEFAULT', false)
//   // console.log(allInstances)
// })();
// 开启订阅
// client.subscribe({ serviceName: providerServiceName, groupName: 'DEFAULT_GROUP' }, () => { })