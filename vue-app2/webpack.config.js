/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:22:19
 * @LastEditors: sueRimn
 * @LastEditTime: 2021-08-19 18:14:41
 */
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const address = require("address");
// 模块联邦的插件
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin
const port = 3002;
const result = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'deploy'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.vue$/i,
        loader: 'vue-loader',
        options: {
          preserveWhitepace: true,
          extractCSS: true,
          cssModules: {},
          //hotReload: false,//根据环境变量生成
        }
      },
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: [
          `  App running at:`,
          `  - Local:    http://localhost:${port}`,
          `  - Network:  http://${address.ip()}:${port}`
        ]
      },
    }),
    new HtmlWebpackPlugin({
      template: './/public/index.html'
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
        'mfpVueAppOne': 'vueAppOne@http://localhost:3001/app1.js'
      },
    })
  ],
  devServer: {
    quiet: true, // necessary for FriendlyErrorsPlugin
    contentBase: resolve(__dirname, 'deploy'),
    port,
  }
}

module.exports = result;