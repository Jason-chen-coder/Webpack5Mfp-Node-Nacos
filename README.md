## 背景

前端应用、微服务的发展，使得模块化的概念越来越重要。 这也不可避免的会产生再不同的项目会有很多功能相似，甚至完全相同。所以跨应用的代码共享尤为重要，之前我们处理这种问题往往采用，

1、功能相似的页面直接赋值方便，不用费脑力直接复用。但这样就会导致项目中代码的复用性低，代码冗余多等问题出现。

2、微服务的出现，很多业务一般使用 npm 发布的形式管理公共包,使用下来我们发现 npm 比较适合对业务逻辑耦合小，完全工具类的包。而对于业务逻辑比较繁重，更新频繁的模块，npm 包使用就会存在迭代需要更新版本的问题,。 并且 npm 包对于业务代码的拆分有工作量，维护成本相对较大，代码有一定质量要求，否则就会导致模块过大的问题。

3、Module Federation 解决了跨应用代码共享

## 什么是 Module Federation

Module federation (模块联邦)使 JavaScript 应用得以从另一个 JavaScript 应用中动态地加载代码 —— 同时共享依赖。

通过细化功能模块、组件复用、共享第三方库、runtime dependencies 线上加载 npm 包等，可以更好的服务于多页应用、微前端等开发模式。

## 如何使用 ModuleFederationPlugin

Module Federation 整体是通过 ModuleFederationPlugin 这个插件串联起来的。

**提供方配置示例**

```js
new ModuleFederationPlugin({
  // 应用名称,调用方使用
  name: 'vueAppOne',
  // 调用方引用的文件名称
  filename: 'app1.js',
  library: { type: 'var', name: 'vueAppOne' },
  exposes: {
    //模块名称
    './untils': './src/untils/count.js',
  },
})
```

**配置属性：**

```js
name，必须，唯一 ID，作为输出的模块名，使用的时通过 name/{name}/name/{expose} 的方式使用；
library，必须，其中这里的 name 为作为 umd 的 name；
remotes，可选，作为引用方最关键的配置项，用于声明需要引用的远程资源包的名称与模块名称，作为 Host 时，去消费哪些 Remote；
exposes，可选，表示作为 Remote 时，export 哪些属性被消费；
shared，可选
```

若是配置了这个属性。webpack 在加载的时候会先判断本地应用是否存在对应的包，若是不存在，则加载远程应用的依赖包。
以 app1 来讲，由于它是一个远程应用，配置了["vue"] ，而它被 app1 所消费，因此 webpack 会先查找 app1 是否存在这个包，若是不存在就使用 app2 自带包。 app2(app2 之后会以案例的形式展现)里面一样申明了这两个参数，由于 app2 是本地应用，因此会直接用 app2 的依赖 在引用远程资源的项目中使用时，需要先远程资源入口文件引入，可以异步加载，也可以使用 script 标签引入。

**消费方配置示例:**

```js
//-----webpack配置:-----
new ModuleFederationPlugin({
  // 导入模块
  remotes: {
    // '导入别名':'远程应用名称/远程应用地址/导入文件的名称'
    mfpVueAppOne: 'vueAppOne@http://localhost:3001/app1.js',
  },
})
//-----vue项目中代码-----
//调用app1的模块
import('mfpVueAppOne/untils').then((res) => {
  res.default(31, 2)
})
```

## Vue 项目应用案例:

1.创建两个 vue 项目

我们使用 webpack 单独部署两个 Vue 项目,目录结构如下:

![在这里插入图片描述](https://img-blog.csdnimg.cn/f593924a14254beda9d1411f44138f77.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_17,color_FFFFFF,t_70,g_se,x_16)

**Vue-app1 的 webpacl.config.js:**

```js
/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:09:16
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-08-19 18:16:41
 */
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const address = require('address')
const port = 3001
// 模块联邦的插件
const ModuleFederationPlugin =
  require('webpack').container.ModuleFederationPlugin
const result = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'output'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitepace: true,
          extractCSS: true,
          cssModules: {},
          //hotReload: false,//根据环境变量生成
        },
      },
    ],
  },
  devServer: {
    contentBase: resolve(__dirname, 'output'),
    port,
    quiet: true, // necessary for FriendlyErrorsPlugin
  },
  plugins: [
    new ProgressBarPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [
          `  App running at:`,
          `  - Local:    http://localhost:${port}`,
          `  - Network:  http://${address.ip()}:${port}`,
        ],
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      // 应用名称,调用方使用
      name: 'vueAppOne',
      //调用放引用的文件名称
      filename: 'app1.js',
      exposes: {
        //模块名称
        './untils': './src/untils/count.js',
        './appOneChildren': './src/App.vue',
      },
    }),
  ],
}

module.exports = result
```

**Vue-app2 的 webpacl.config.js:**

```js
/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:22:19
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-23 11:40:23
 */
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const address = require('address')
// 模块联邦的插件
const ModuleFederationPlugin =
  require('webpack').container.ModuleFederationPlugin
const port = 3002
const result = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'deploy'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.vue$/i,
        loader: 'vue-loader',
        options: {
          preserveWhitepace: true,
          extractCSS: true,
          cssModules: {},
          //hotReload: false,//根据环境变量生成
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(__dirname, './public'),
          to: '',
        },
      ],
    }),
    new ProgressBarPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [
          `  App running at:`,
          `  - Local:    http://localhost:${port}`,
          `  - Network:  http://${address.ip()}:${port}`,
        ],
      },
    }),
    new HtmlWebpackPlugin({
      template: './/public/index.ejs',
    }),
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      // 应用名称,调用方使用
      name: 'vueAppTwo',
      //调用放引用的文件名称
      filename: 'app2.js',
      // 导入模块
      remotes: {
        // '导入别名':'远程应用名称/远程应用地址/导入文件的名称'
        mfpVueAppOne: 'vueAppOne@http://localhost:3001/app1.js',
        // 'mfpVueAppOne': 'vueAppOne@http://localhost:3002/output/app1.js'
      },
    }),
  ],
  devServer: {
    quiet: true, // necessary for FriendlyErrorsPlugin
    contentBase: resolve(__dirname, 'deploy'),
    port,
  },
}

module.exports = result
```

**package.json(app1 与 app2 一致)**

```json
{
  "name": "vue-app2",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "cross-env NODE_ENV=development webpack serve",
    "build": "cross-env NODE_ENV=production webpack "
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "address": "^1.1.2",
    "cross-env": "^7.0.3",
    "css-loader": "^6.2.0",
    "friendly-errors-webpack-plugin": "^1.7.0",
    "html-webpack-plugin": "^5.3.2",
    "less": "^4.1.1",
    "less-loader": "^10.0.1",
    "progress-bar-webpack-plugin": "^2.1.0",
    "style-loader": "^3.2.1",
    "url-loader": "^4.1.1",
    "vue": "^2.6.14",
    "vue-loader": "^15.9.8",
    "vue-template-compiler": "^2.6.14",
    "webpack": "^5.50.0",
    "webpack-cli": "^4.8.0",
    "webpack-dev-server": "^3.11.2"
  },
  "dependencies": {
    "copy-webpack-plugin": "^9.0.1",
    "vue-i18n": "^8.25.0"
  }
}
```

我们在 app2 中引入 app1 共享的 appOneChildren 组件:
![在这里插入图片描述](https://img-blog.csdnimg.cn/1307ede477944a6cb18f8725ff38abe1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

分别在 app1 和 app2 的终端中执行:

```js
yarn dev
```

app2 运行效果:

![在这里插入图片描述](https://img-blog.csdnimg.cn/b3ade61b602f4e29829c78ece8764d4c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

这样我们就成功从 app2 成功引用了 app1 共享出来的代码,并成功运用到 app2 中了

## 其他的使用方式:

如上述所说我们通过 webpack-dev-serve 启动了两个前端项目,并且通过模块联邦共享出来了他们各自的代码模块,但是我们能否实现在前端项目打包后,实现模块联邦呢?

操作步骤:

## 一、app1 打包，app2 在线，app2 访问 app1 资源

1.我们先将 app1 进行打包,我们在 app1 目录中执行

```js
webpack
```

2.我们先将 app1 打包生成的 output 目录复制到 app2 中的 public 目录中(让 app2 通过 webpack-dev-serve 跑起来时可以拿到 app1 打包后的资源)
![在这里插入图片描述](https://img-blog.csdnimg.cn/a5f784b86f734a029deac9648dc28d76.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_19,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/25d34add0ef741b3ba201c9b9bc6946a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

3.1 我们先单独将 app2 前端用 webpack-dev-serve 跑起来,看看是否能拿得到 public 中的 app1 资源:

前置工作:因为我们在 app2 中是要获取 app1 共享出来的代码的,而现在 app1 打包后的代码保存在 app2 的 public 目录中,所以 app2 的 webpack 中消费 app1 的地址需要修改为 app2 它自己的地址

'mfpVueAppOne': `vueAppOne@http://localhost:${port}/output/app1.js`

![在这里插入图片描述](https://img-blog.csdnimg.cn/f2fefec4dc2d4f66b90b47df51e15427.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

运行 app2:

![在这里插入图片描述](https://img-blog.csdnimg.cn/96cb8bcb67854bc796ff0557fe80b76d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

由图可见,此方案是可以行的,我们只需要可以访问 app1 的资源即可使用 app1 通过模块联邦分享过来的代码了

## 二、app1 打包，app2 打包，app2 访问 app1 资源

1.我们 app2 项目在线时可以拿到 app1 的资源了;现在我们尝试打包 app2

前置工作:因为我们在 app2 中是要获取 app1 共享出来的代码的,而现在 app1 打包后的代码保存在 app2 的 public 目录中,所以 app2 的 webpack 中消费 app1 的地址需要修改为 app2 它自己的地址

'mfpVueAppOne': `vueAppOne@./output/app1.js`

![在这里插入图片描述](https://img-blog.csdnimg.cn/53996e23ecec430390977dfeaacc8f2c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

2.在 app2 根目录执行

```js
webpack
```

3.生成项目打包文件
![在这里插入图片描述](https://img-blog.csdnimg.cn/cbf2e8c7b0674ce3a92245f6a34d9610.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

4.我们在 app2 中跑一个本地的 node 服务访问 deploy 中的 index.html 看看是否正常:

web-serve/index.js 文件:

```js
/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-20 15:31:00
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-23 13:52:39
 */
const express = require('express')

const expressStaticGzip = require('express-static-gzip')
const app = express()

app.use(
  expressStaticGzip('../', {
    maxAge: '3d',
    setHeaders: setCustomCacheControl,
  })
)

function setCustomCacheControl(res, currentFilePath, stat) {
  if (currentFilePath.match(/\index\.html$/)) {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'no-cache')
  }
}

app.use(express.static('../deploy'))

app.listen(9901, (req, res) => {
  console.log(req, res)
  console.log('启动成功，请通过localhost:9901访问')
})
```

5.在 web-serve 目录中执行

```js
node index.js
```

6. 运行效果

![在这里插入图片描述](https://img-blog.csdnimg.cn/42d7f865063c4447a69e62baf83e2cc5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

由图可见,此方案是可以行的,及时 app2 项目已经被打包成静态资源了,app2 中只需要可以访问 app1 的资源即可使用 app1 通过模块联邦分享过来的代码了

## 三、国际化实践

1.我们在 app1 中使用 vue-i18n,app2 中不开启 vue-i18n,查看效果
![在这里插入图片描述](https://img-blog.csdnimg.cn/cd8a2b5c167948efb772f5a4ac35fcd0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

app1 中国际化使用正常

![在这里插入图片描述](https://img-blog.csdnimg.cn/272c473b09f14f3996d054445ac0b4f1.png)

2.app2 中暂不使用 vue-i18n 并在 app2 中引入 app1 通过模块联邦分享的代码

![在这里插入图片描述](https://img-blog.csdnimg.cn/8490975d301d4f52bab28c0557424eaa.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

**3.我们发现 app2 中报错了,$t 未定义,所以 app2 在 app1 中运行时,所使用的插件或其他依赖是需要消费方提供的,**

**3.1 我们在 app2 中安装 vue-i18n 并注册**

**3.2 并且 app1 它也把自己用到的国际化文件也导出并合到 app2 的 vue-i18n 的语言库里去**

![在这里插入图片描述](https://img-blog.csdnimg.cn/5efec2a06e964e03bc648b0491c78c1a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/ef895c72b07e4af49202498527ee109c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

app1 和 app2 重新运行项目效果:
![在这里插入图片描述](https://img-blog.csdnimg.cn/6741b0761d824df3a81ad158cfb6e05a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

## 四、配置：shared

    除了前面提到的模块引入和模块暴露相关的配置外，还有个 shared 配置，主要是用来避免项目出现多个公共依赖。

例如，我们当前的 app1，已经引入了一个 vue-i18n 和 Vue，而 app2 暴露的组件也依赖了 vue-i18n 和 Vue。如果不解决这个问题，app1 就会加载两个 vue-i18n 和 Vue 库。影响页面性能。

所以，我们在使用 Module Federation 的时候一定要记得，将公共依赖配置到 shared 中。

**4.1 接下来，我们在浏览器打开 app1，在 Chrome 的 network 面板中，可以看到 app1 直接使用了项目 B 的 vue-i18n。**

![在这里插入图片描述](https://img-blog.csdnimg.cn/8816313fedf74532ac770d4f1186ece6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

**4.2 我们在 app1 处配置 shared:**

![在这里插入图片描述](https://img-blog.csdnimg.cn/19d4d67fdaae4413a657792554fc5ccb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

**4.3 重新运行 app1 项目,在 app2 页面中查看 netWork:**

我们可以看到如果提供方应用配置了 shared 之后,消费方就不会去下载 vue-i18n 和 Vue 这两个库了

![在这里插入图片描述](https://img-blog.csdnimg.cn/fbaa3cac4a1a4d0485bcbaf26f302ca6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

## **五、动态加载远程联邦模块**

第一步:我们在 webpack 的官网文档中可以看到,我们模块联邦可以动态的加载远端的代码资源:

![在这里插入图片描述](https://img-blog.csdnimg.cn/54b1716b47544c96820789e60db81c67.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

关键代码:

```js
new Promise((resolve) => {
  const urlParams = new URLSearchParams(window.location.search)
  const version = urlParams.get('app1VersionParam')
  // 这一部分取决于您计划如何托管和版本化您的联邦模块
  const remoteUrlWithVersion =
    'http://localhost:3001/' + version + '/remoteEntry.js'
  const script = document.createElement('script')
  script.src = remoteUrlWithVersion
  script.onload = () => {
    //注入的脚本已加载，可在Windows上使用
    const proxy = {
      get: (request) => window.app1.get(request),
      init: (arg) => {
        try {
          return window.app1.init(arg)
        } catch (e) {
          console.log('remote container already initialized')
        }
      },
    }
    resolve(proxy)
  }
  // 将 script设置为 versioned 注入此脚本 remoteEntry.js
  document.head.appendChild(script)
})
```

这一步使我们通过 script 标签成功注入远端联邦模块的入口 remoteEntry.js ,

**第二步:我们需要加载远端联邦模块的组件(容器):**

![在这里插入图片描述](https://img-blog.csdnimg.cn/0aa1315c62dd4d6481cd41d5593cb496.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

**关键代码:**

```js
function loadComponent(scope, module) {
  return async () => {
    // 初始化共享作用域（shared scope）用提供的已知此构建和所有远程的模块填充它
    await __webpack_init_sharing__('default')
    const container = window[scope] // 或从其他地方获取容器
    // 初始化容器 它可能提供共享模块
    await container.init(__webpack_share_scopes__.default)
    const factory = await window[scope].get(module)
    const Module = factory()
    return Module
  }
}
```

**第一步和第二步汇总:**

```js
export async function loadRemoteComponent(config) {
  return loadScript(config).then(() => loadComponentByWebpack(config))
}

function loadScript(config) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = config.url
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => {
      console.log(`Dynamic Script Loaded: ${config.url}`)
      document.head.removeChild(script)
      resolve()
    }
    script.onerror = () => {
      console.error(`Dynamic Script Error: ${config.url}`)
      document.head.removeChild(script)
      reject()
    }
    document.head.appendChild(script)
  })
}

async function loadComponent({ scope, module }) {
  // 初始化共享作用域，这将使用此构建和所有远程提供的已知模块填充它
  await __webpack_init_sharing__('default')
  const container = window[scope] // 获取容器
  // 初始化容器，它可以提供共享模块
  await container.init(__webpack_share_scopes__.default)
  const factory = await window[scope].get(module)
  return factory()
}
```

我们先观察到这个 loadRemoteComponent 方法，它内部 return 了获取到的远程组件的数据，往下看这个 loadScript 方法，它返回了一个 Promise，内部的代码我们稍微瞄一眼就知道这里是在使用 js 动态创建 script 标签的方式来加载一个远程 js 文件，当加载完毕时，将这个标签从页面中移除，然后结束。

当 js 文件加载完毕之后，页面中就拿到了远程项目暴露的组件信息，这个时候，我们就能使用 loadComponent 来加载指定的组件了，这个函数中主要就是初始化远程组件所需的环境，并根据我们传入的 module，从相关作用域中查到到对应的模块进行返回;

**在 vue2 中使用:**

```html
<template>
  <div class="vue-app1">
    <h1>这里是Vue-App2.vue</h1>
    <children ref="children"></children><br />
    <appOneChildren></appOneChildren>
  </div>
</template>
<script>
  import children from './component/children.vue'
  import { loadRemoteComponent } from './untils/index.js'

  export default {
    components: {
      children,
      appOneChildren: async () => {
        const app1 = await loadRemoteComponent({
          url: 'http://localhost:3001/app1.js',
          scope: 'vueAppOne',
          module: './appOneChildren',
        })
        return app1
      },
    },
  }
</script>
```

**效果:**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2cb2a17fdc21481e8330126f000e9b28.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

简单理解:

**url**:就是我们模块联邦提供方的入口文件的地址;

**scope**:就是我们提供方模块联邦中 name 的值;

**module**:就是提供方在模块联邦中 exposes 中的 key;

如下是 app1(提供方)中的模块联邦的配置:

![image2021-8-26_14-39-28.png](https://img-blog.csdnimg.cn/80a161ef89f34a1498a023ab27b8e947.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_19,color_FFFFFF,t_70,g_se,x_16)

# webpack5 + Node.js+ Nacos 搭建微前端应用网络

## 一、关于 Nacos

### 什么是 Nacos?

**官方介绍**
https://nacos.io/zh-cn/docs/what-is-nacos.html

Nacos 致力于帮助您发现、配置和管理微服务。Nacos 提供了一组简单易用的特性集，帮助您快速实现动态服务发现、服务配置、服务元数据及流量管理。

Nacos 帮助您更敏捷和容易地构建、交付和管理微服务平台。 Nacos 是构建以“服务”为中心的现代应用架构 (例如微服务范式、云原生范式) 的服务基础设施。

**简单概括一下**
Nacos 可以做两方面用途：

    配置服务中心
    服务注册中心

nacos 调用的完整流程
整个 nacos 服务链路上分三种角色：**nacos 服务器**，**服务提供方**，**服务消费方**

- 服务提供者告诉 nacos 服务器，我可以提供服务。
- 消费方通过访问 nacos 服务器，根据服务名查询有哪些服务提供方。
- 消费方获取到具体的服务提供方列表，然后从中选取一个服务提供者调用具体服务。

搭建 Nacos 服务中心
https://nacos.io/zh-cn/docs/quick-start.html

您可以在 Nacos 的 release notes 及博客中找到每个版本支持的功能的介绍，当前推荐的稳定版本为 1.3.1。

创建服务提供方 NodeJS 应用
初始化环境:
nacos 服务地址:http://10.22.5.14:32572/

安装 Node LST (8.x.x) 环境： https://nodejs.org/zh-cn;我本地安装的Node 版本是 v14.17.4

nacos 关于 nodejs 的 sdk:https://github.com/nacos-group/nacos-sdk-nodejs

### 创建一个 ndoe 项目:

#### 1.执行:

```js
npm init
npm install nacos ip
```

**2.创建 config-service 和 service-discovery 文件:**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2fa85878abaa44eba6b128d90412ced3.png)

**3.注册配置文件**

config-service.js:

```js
/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-27 10:05:04
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-27 14:03:06
 */
// 注册配置,获取配置
const NacosConfigClient = require('nacos').NacosConfigClient
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572'
// namespace: 名称空间必须在服务器上存在
const providerNamespase = 'domain'
// 名称空间下的Group
const group = 'DEFAULT_GROUP'
// 命名空间下的Data Id
const dataId = 'test1'
// for direct mode
const configClient = new NacosConfigClient({
  serverAddr: nacosServerAddress,
  namespace: providerNamespase,
})

// 获取nacos配置
;(async () => {
  const content1 = await configClient.getConfig(dataId, group)
  console.log('[Nacos] 获取配置： ', content1)
})()

// 监听远程nacos配置变化
configClient.subscribe(
  {
    dataId: dataId,
    group: group,
  },
  (content) => {
    console.log('[Nacos] 监听远程nacos配置:', content)
  }
)
```

**3.1 执行:**

```js
node config-servce.js
```

**3.2 执行结果:**

终端输出结果:
![在这里插入图片描述](https://img-blog.csdnimg.cn/26a6f6d3b397497aa7080769c1d1e311.png)
在 nacos 中查看配置:
![在这里插入图片描述](https://img-blog.csdnimg.cn/e94080aefa4d455c812432eed60cd17b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

    3.3 在nacos中修改配置:

![在这里插入图片描述](https://img-blog.csdnimg.cn/8cfb465654f142168bf7382f43f4bab8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

    终端监听到配置修改:

![在这里插入图片描述](https://img-blog.csdnimg.cn/43b47f35b3c54d6e8d3062399e5d54bf.png)

4.service-discovery.js:

```js
/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-27 11:22:32
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-27 14:09:32
 */
// 注册服务到Nacos服务器
const { NacosNamingClient } = require('nacos')

const { address } = require('ip')
const logger = console

// 动态获取本机 IP 地址
const ipAddr = address()
// 我们当前app1应用的端口号
const port = 3001

// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'component-app1'
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572'
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'domain'
const client = new NacosNamingClient({
  logger,
  serverList: nacosServerAddress,
  namespace: providerNamespase,
})
console.log('[Nacos] 注册Nacos服务')
;async () => {
  const allinstance = await client.getAllInstances()
  console.log('[Nacos]----allinstance----', allinstance)
}
;(async () => {
  try {
    await client.ready()
    // 注册服务和实例
    await client.registerInstance(providerServiceName, {
      ip: ipAddr,
      port,
    })
    // 这里也可以传入group，不传默认就是 DEFAULT_GROUP
    // const groupName = 'nodejs';
    // await client.registerInstance(providerServiceName, {
    // ip: ipAddr,
    // port
    // }, groupName);
    console.log(`[Nacos] Nacos服务注册实例成功: ${ipAddr}:${port}`)
  } catch (err) {
    console.log('[Nacos] Nacos服务注册实例失败: ' + err.toString())
  }
})()
```

    4.1 终端执行:

```js
node service-discovery.js
```

          终端输出结果:

![在这里插入图片描述](https://img-blog.csdnimg.cn/0da5a77f6fb340c998d485cdd2acd313.png)

           在nacos中查看配置:

![在这里插入图片描述](https://img-blog.csdnimg.cn/b69458449b4d46479151372f12af1c2b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

二、基于 Node+Nacos 开始搭建服务关系网:
以下 nacos 相关步骤我们主要使用 Nacos 的服务注册中心功能:整体设计如下图:

![在这里插入图片描述](https://img-blog.csdnimg.cn/8be17224fbcf4c85a1dcf067d3b59628.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

我们准备三个项目分别是 app1,app2,app3;

第一步:
我们将 app1 和 app2 项目进行打包,并在根目录起一个 node 服务,

node 服务的作用:

          1.app1服务和app2服务开放deploy目录,供外界访问;

          2.分别注册到nacos中(将app1和app2通过webpack模块联邦打包出来的静态资源地址保存在meta中,

                如 address=10.18.31.46:9900/app1.js, 其中app1.js就是webpack模块联邦打包出来的文件,当消费方拿到这个文件即可加载app1通过webpack模块联邦暴露出来的模块

app1 项目目录(app2 目录类似):

![在这里插入图片描述](https://img-blog.csdnimg.cn/813b825bb7ee475e81dbe7afdee70cde.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

app.js

```js
const express = require('express')
const app = express()

// nacos相关
const { NacosNamingClient } = require('nacos')
const { address } = require('ip')
// 动态获取本机 IP 地址
const ipAddr = address()
// 我们当前app1应用的端口号
const port = 9900
const logger = console
// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'component-app1'
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572'
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'domain'

app.use(express.static('../output'))

app.listen(port, () => {
  console.log(`启动成功:localhost:${port}`)
})

// 注册服务到Nacos服务器
const client = new NacosNamingClient({
  logger,
  serverList: nacosServerAddress,
  namespace: providerNamespase,
})

;(async () => {
  try {
    await client.ready()
    // 注册服务和实例
    await client.registerInstance(providerServiceName, {
      ip: ipAddr,
      port,
      metadata: {
        componentName: 'vue-app1',
        address: `${ipAddr}:${port}/app1.js`,
      },
    })
    console.log(`[Nacos] Nacos服务实例注册成功: ${ipAddr}:${port}`)
  } catch (err) {
    console.log('[Nacos] Nacos服务实例注册失败: ' + err.toString())
  }
})()
```

启动 app1 和 app2 的 node 服务:

分别到 app1 和 app2 中 web-serve 目录下执行:

```js
node app.js
```

当 app1 和 app2 的实例注册到 nacos 成功后

![在这里插入图片描述](https://img-blog.csdnimg.cn/a52e577e78c04e3b95d10fe58e05eefc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

第二步:
我们在 app3 根目录起一个 node 服务,

app3 项目目录:

![在这里插入图片描述](https://img-blog.csdnimg.cn/2ed950ad728c445f86909ad4b0af8d82.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

app.js

```js
const express = require('express')
const app = express()

// nacos相关
const { NacosNamingClient } = require('nacos')
// 我们当前应用的端口号
const port = 9090
const logger = console
// 服务名称，后面消费方调用的时候通过这个服务名进行服务查询。
const providerServiceName = 'component-app1'
// nacos服务地址
const nacosServerAddress = '10.22.5.14:32572'
// namespace: 命名空间必须在服务器上存在
const providerNamespase = 'domain'

app.use(express.static('../deploy'))

app.listen(port, () => {
  console.log(`启动成功:localhost:${port}`)
})

// 注册服务到Nacos服务器
const client = new NacosNamingClient({
  logger,
  serverList: nacosServerAddress,
  namespace: providerNamespase,
})
// app3前端页面发起查询实例列表请求
app.get('/nacos/getAllInstances', async (req, res) => {
  let allInstances = await client.getAllInstances(
    providerServiceName,
    'DEFAULT_GROUP',
    'DEFAULT',
    false
  )
  res.send(allInstances)
})
```

启动 app3 的 node 服务:到 app3 中 web-serve 目录下执行:

```js
node app.js
```

    目的:

    1.与nacos建立连接,拿到nacos中的实例列表 ;

    2.部署app3前端项目

![在这里插入图片描述](https://img-blog.csdnimg.cn/1fea4fd3d15946b2a7ee9c309edb71c3.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

说明:app3 的前端页面发起 '/nacos/getAllInstances' 这个请求会走到 app3 的 node 服务,通过 node 服务查询到 nacos 的实例列表后返回给前端,前端再拿到 app1 和 app2 的资源地址;

![在这里插入图片描述](https://img-blog.csdnimg.cn/ee42bb159db5457b925a26c90ad2bae7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/8751f66807f54bc194cd595fcd9caebd.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/2693ba1846cd444cbb03ae14e8f3c488.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

场景 1:消费方因为网络或等其他原因获取不到远端提供方的资源时;(如当远端的应用掉线了或消费方这边发起的查询消费方服务的请求出错)
![在这里插入图片描述](https://img-blog.csdnimg.cn/780ac19b9f8e49bd985a08e3ebb2c82b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

解决方案:

第一步:将提供方的静态资源放到消费方的目录中:

![在这里插入图片描述](https://img-blog.csdnimg.cn/e12200356648459cb5d49c3472d6fda0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_12,color_FFFFFF,t_70,g_se,x_16)

第二步:当消费方获取提供方资源时,直接获取本地目录中关于提供方经过模块联邦打包后的的 js 文件(app1.js 和 app2.js)即可;
![在这里插入图片描述](https://img-blog.csdnimg.cn/a097ac910d4a4d57b3e3b9599b196e90.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

第三步效果:

![在这里插入图片描述](https://img-blog.csdnimg.cn/a3fc8efb7f314e5cb483a8bf3a98c78e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

我们从此处可以看到虽然 getAllInstance 这个接口报错了(获取不到远端提供方的静态资源地址);但我们可选择加载本地准备好的的资源进行渲染;

场景 2:消费方无法正常获取提供方的字体图标资源:
解决方案 1:消费方的字体图标库需要包含提供方的字体图标库;(即提供方中字体图标的类名在消费方的环境中(iconfont.css)中是可以匹配到的)

![在这里插入图片描述](https://img-blog.csdnimg.cn/18e8dc27e30c4e0686f8da4a128ab0d2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

解决方案 2:

    第一步:提供方通过模块联邦暴露iconfont.js文件(此方法需要提供方使用svg的形式来渲染字体图标)

      1.1参考iconfont官方提供的 symbol 引用方式 :

![在这里插入图片描述](https://img-blog.csdnimg.cn/4635fdf74d324c4bbf7851f9ae3bc4ea.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

      1.2 提供方字体元素使用svg ;

![在这里插入图片描述](https://img-blog.csdnimg.cn/2e3403c576cc4e9993dfe2dab7ebef00.png)

      1.3 提供方并暴露iconfont.js文件:

![在这里插入图片描述](https://img-blog.csdnimg.cn/22cc255d16cd4d4d80cc4ec97a865913.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

    第二步:消费方加载提供方的iconfont.js文件即可

![](https://img-blog.csdnimg.cn/4422ece283da41feaab80c46101b606a.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/8797168f27684fdeb7f043b0ba0aef6e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBA6IqC55yB6ZKx,size_20,color_FFFFFF,t_70,g_se,x_16)

## 项目地址:

[https://github.com/Jason-chen-coder/webpack-mfp](https://github.com/Jason-chen-coder/webpack-mfp)
