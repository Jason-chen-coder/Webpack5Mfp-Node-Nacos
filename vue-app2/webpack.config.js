/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:22:19
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-06 16:10:06
 */
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const address = require("address");
// 模块联邦的插件
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin
const port = 3002;
const result = {
  mode: process.env.NODE_ENV,
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'deploy'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitepace: true,
          extractCSS: true,
          cssModules: {},
          //hotReload: false,//根据环境变量生成
        }
      },
      {
        oneOf: [
          {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
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
            test: /\.(png|jpg|gif)$/i,
            use: [
              {
                loader: 'url-loader',
                options: {
                  limit: 150,//文件大小限制，小于则用base64编码
                  esModule: false, //关闭es模块语法
                  name: 'images/[name]_[hash:7].[ext]'

                }
              }
            ],
            type: 'javascript/auto'
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 0,
              esModule: false, //关闭es模块语法
              name: '/font/[name].[contenthash:7].[ext]',
            },
            type: 'javascript/auto'
          },
        ]
      }
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(__dirname, './public'),
          to: '',
        },
      ]
    }),
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
      template: './/public/index.ejs'
    }),
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      // 应用名称,调用方使用
      name: 'vueAppTwo',
      //调用放引用的文件名称
      filename: 'app2.js',
      exposes: {
        //模块名称
        './appTwoChildren': './src/App.vue'
      },
      // 导入模块
      remotes: {
        // '导入别名':'远程应用名称/远程应用地址/导入文件的名称'
        // 'mfpVueAppOne': process.env.NODE_ENV === 'development' ? `vueAppOne@http://localhost:${port}/output/app1.js` : `vueAppOne@./output/app1.js`
        // 'mfpVueAppOne': 'vueAppOne@http://localhost:3001/app1.js'
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