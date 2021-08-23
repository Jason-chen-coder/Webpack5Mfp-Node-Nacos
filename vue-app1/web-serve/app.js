/*
 * @Descripttion: 
 * @version: 
 * @Author: Jason chen
 * @Date: 2021-08-20 15:31:00
 * @LastEditors: Jason chen
 * @LastEditTime: 2021-08-23 15:07:01
 */
const express = require('express');
const proxy = require('http-proxy-middleware');

// webpack打包好gzip文件
const expressStaticGzip = require('express-static-gzip');
const app = express();

app.use(
  expressStaticGzip('../', {
    maxAge: '3d',
    setHeaders: setCustomCacheControl,
  })
);

function setCustomCacheControl (res, currentFilePath, stat) {
  if (currentFilePath.match(/\index\.html$/)) {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'no-cache');
  }
}

app.use(express.static('../output'));



app.listen(9900, (req, res) => {
  console.log(req, res);
  console.log('启动成功，请通过localhost:9900访问');
});

