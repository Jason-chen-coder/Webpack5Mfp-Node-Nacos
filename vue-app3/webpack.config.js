/*
 * @Descripttion:
 * @version:
 * @Author: Jason chen
 * @Date: 2021-08-18 14:09:16
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-09-07 10:39:50
 */
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const address = require("address");
let MiniCssExtractPlugin = require("mini-css-extract-plugin");
const port = 3003;
// 模块联邦的插件
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin
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
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader" },
          { loader: "less-loader" }
        ]
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
    ],
  },
  devServer: {
    contentBase: resolve(__dirname, 'output'),
    port,
    quiet: true, // necessary for FriendlyErrorsPlugin
    proxy: {
      '/nacos': {
        target: 'http://localhost:9090',//代理地址，这里设置的地址会代替axios中设置的baseURL
        changeOrigin: true,// 如果接口跨域，需要进行这个参数配置
        //ws: true, // proxy websockets
        //pathRewrite方法重写url
        pathRewrite: {
          '^/nacos': '/nacos'
        }
      },
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/common.css"
    }),
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
      template: './public/index.ejs'
    }),
    new VueLoaderPlugin(),
    new ModuleFederationPlugin({
      // 应用名称,调用方使用
      name: 'vueAppOne',
      //调用放引用的文件名称
      filename: 'app3.js',
    })
  ],

}

module.exports = result;