# 背景

前端应用、微服务的发展，使得模块化的概念越来越重要。 这也不可避免的会产生再不同的项目会有很多功能相似，甚至完全相同。所以跨应用的代码共享尤为重要，之前我们处理这种问题往往采用，

1、功能相似的页面直接赋值方便，不用费脑力直接复用。但这样就会导致项目中代码的复用性低，代码冗余多等问题出现。

2、微服务的出现，很多业务一般使用 npm 发布的形式管理公共包。我们 EDSP 前端项目也是用了 npm 插件形式;但在使用下来我们发现 npm 比较适合对业务逻辑耦合小，完全工具类的包。而对于业务逻辑比较繁重，更新频繁的模块，npm 包使用就会存在迭代需要更新版本的问题,。 并且 npm 包对于业务代码的拆分有工作量，维护成本相对较大，代码有一定质量要求，否则就会导致模块过大的问题。

3、Module Federation 解决了跨应用代码共享

**什么是 Module Federation**
Module federation (模块联邦)使 JavaScript 应用得以从另一个 JavaScript 应用中动态地加载代码 —— 同时共享依赖。

通过细化功能模块、组件复用、共享第三方库、runtime dependencies 线上加载 npm 包等，可以更好的服务于多页应用、微前端等开发模式。

如何使用 ModuleFederationPlugin
Module Federation 整体是通过 ModuleFederationPlugin 这个插件串联起来的。

**发送方配置示例：**

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

配置属性：

name，必须，唯一 ID，作为输出的模块名，使用的时通过 name/{name}/name/{expose} 的方式使用；

library，必须，其中这里的 name 为作为 umd 的 name；

remotes，可选，作为引用方最关键的配置项，用于声明需要引用的远程资源包的名称与模块名称，作为 Host 时，去消费哪些 Remote；

exposes，可选，表示作为 Remote 时，export 哪些属性被消费；

shared，可选,若是配置了这个属性。webpack 在加载的时候会先判断本地应用是否存在对应的包，若是不存在，则加载远程应用的依赖包。以 app1 来讲，由于它是一个远程应用，配置了["vue"] ，而它被 app1 所消费，因此 webpack 会先查找 app1 是否存在这个包，若是不存在就使用 app2 自带包。 app2(app2 之后会以案例的形式展现)里面一样申明了这两个参数，由于 app2 是本地应用，因此会直接用 app2 的依赖 在引用远程资源的项目中使用时，需要先远程资源入口文件引入，可以异步加载，也可以使用 script 标签引入。

**调用方配置示例:**

```js
//-----webpack配置:-----
// 联邦调用
//调用app1的模块
import('mfpVueAppOne/untils').then((res) => {
  res.default(31, 2)
})

// 调用
new ModuleFederationPlugin({
  // 导入模块
  remotes: {
    // '导入别名':'远程应用名称/远程应用地址/导入文件的名称'
    mfpVueAppOne: 'vueAppOne@http://localhost:3001/app1.js',
  },
})
```

## Vue 项目案例:

1.创建两个 vue 项目
我们使用 webpack 单独部署两个 Vue 项目,目录结构如下:
![在这里插入图片描述](https://img-blog.csdnimg.cn/14a14035e42f4fc6a691f33852997568.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)
**Vue-app1 的 webpacl.config.js:**

```js
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

我们在 app2 中引入 app1 共享的 appOneChildren 组件:
![在这里插入图片描述](https://img-blog.csdnimg.cn/99160561b9a840a4a9d09185da013630.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

**运行效果:**

![](https://img-blog.csdnimg.cn/8bc6df57ef5c45c1989e772f110691fd.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)
这样我们就成功从 app2 成功引用了 app1 共享出来的代码,并成功运用到 app2 中了

## 其他的使用方式:

如上述所说我们通过 webpack-dev-serve 启动了两个前端项目,并且通过模块联邦共享出来了他们各自的代码模块,但是我们能否实现在前端项目打包后,实现模块联邦呢?

操作步骤:

### 一、app1 打包，app2 在线，app2 访问 app1 资源

1.我们先将 app1 进行打包,我们在 app1 目录中执行

```js
webpack
```

2.我们先将 app1 打包生成的 output 目录复制到 app2 中的 public 目录中(让 app2 通过 webpack-dev-serve 跑起来时可以拿到 app1 打包后的资源)
![在这里插入图片描述](https://img-blog.csdnimg.cn/231e39d9aec44dceb8d8ec6af3346680.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/460dff9964934b1eb7d5c720ddea072a.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/843acc9d054d476f82b51b73c3b6eea8.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

3.1 我们先单独将 app2 前端用 webpack-dev-serve 跑起来,看看是否能拿得到 public 中的 app1 资源:

**前置工作**: 因为我们在 app2 中是要获取 app1 共享出来的代码的,而现在 app1 打包后的代码保存在 app2 的 public 目录中,所以 app2 的 webpack 中消费 app1 的地址需要修改为 app2 它自己的地址

'mfpVueAppOne': `vueAppOne@http://localhost:${port}/output/app1.js`

![在这里插入图片描述](https://img-blog.csdnimg.cn/a2168a646cdc43f891ba6430a7ade68b.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

**运行 app2:**

![在这里插入图片描述](https://img-blog.csdnimg.cn/a5e155abf54d40c8b4a76517a406ee86.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

由图可见,此方案是可以行的,我们只需要可以访问 app1 的资源即可使用 app1 通过模块联邦分享过来的代码了

二、app1 打包，app2 打包，app2 访问 app1 资源 1.我们 app2 项目在线时可以拿到 app1 的资源了;现在我们尝试打包 app2

前置工作:因为我们在 app2 中是要获取 app1 共享出来的代码的,而现在 app1 打包后的代码保存在 app2 的 public 目录中,所以 app2 的 webpack 中消费 app1 的地址需要修改为 app2 它自己的地址

'mfpVueAppOne': `vueAppOne@./output/app1.js`

![在这里插入图片描述](https://img-blog.csdnimg.cn/9254c661d4f949b1b4a094184c5b1301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

2.在 app2 根目录执行

```js
webpack
```

3.生成项目打包文件

![在这里插入图片描述](https://img-blog.csdnimg.cn/92506b84e5b24cd38ff9bba4c4b89586.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

4.我们在 app2 中跑一个本地的 node 服务访问 deploy 中的 index.html 看看是否正常:

web-serve/index.js 文件:

```js
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

![在这里插入图片描述](https://img-blog.csdnimg.cn/8f9c2b38652a4af8a794c65866c47418.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zOTA4NTgyMg==,size_16,color_FFFFFF,t_70)

由图可见,此方案是可以行的,及时 app2 项目已经被打包成静态资源了,app2 中只需要可以访问 app1 的资源即可使用 app1 通过模块联邦分享过来的代码了
