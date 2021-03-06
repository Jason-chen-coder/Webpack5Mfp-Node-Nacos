/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:20:50
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-16 15:33:08
 */

export async function loadRemoteComponent (config) {
  return loadScript(config).then(() => loadComponentByWebpack(config))
}
/**
 * 加载模块联邦入口文件
 * @param {Object} config 
 * @returns 
 */
function loadScript (config) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = config.url
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => {
      console.log(`Dynamic Script Loaded: ${config.url}`)
      document.head.removeChild(script);
      resolve();
    }
    script.onerror = () => {
      console.error(`Dynamic Script Error: ${config.url}`)
      document.head.removeChild(script)
      reject()
    }
    document.head.appendChild(script)
  })
}

/**
 * 加载模块联邦组件
 * @param {Object} 
 * @returns 
 */
async function loadComponentByWebpack ({ scope, module }) {
  // 初始化共享作用域，这将使用此构建和所有远程提供的已知模块填充它
  await __webpack_init_sharing__('default')
  const container = window[scope] // 获取容器
  // 初始化容器，它可以提供共享模块
  await container.init(__webpack_share_scopes__.default);
  const factory = await window[scope].get(module);
  return factory();
}
/**
 * 是否立即拉取所有实例列表
 * @param {String} componentName -组件名
 * @param {Boolean} ifPull -是否拉取最新数据
 * @returns {Promise}
 */

export function getComponentInfo (componentName, ifPull = false) {
  return new Promise(async (resolve, reject) => {
    let nacosInstancesList = JSON.parse(localStorage.getItem('nacosInstancesList')) || [];
    let appInfo = nacosInstancesList.filter(item => item.metadata.componentName.includes(componentName)).pop();
    if (!nacosInstancesList || !appInfo || ifPull) {
      try {
        let res = await fetch('/nacos/getAllInstances', {
          method: 'get'
        })
        nacosInstancesList = await res.json();
        localStorage.setItem('nacosInstancesList', JSON.stringify(nacosInstancesList))
        appInfo = nacosInstancesList.filter(item => item.metadata.componentName.includes(componentName)).pop();
      } catch {
        reject('请求实例失败')
      }
    }
    resolve(appInfo);
  })
}