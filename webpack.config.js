const path = require('path'); 
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

var options = {
    entry: "./app/index.js", // 入口文件

    // 输出文件 build下的bundle.js
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: "bundle.js"
    },

    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      port: 3000
    },

    reslove: {
      extensions: ['', '.js', '.scss', '.css']
    },

    // 使用loader模块
    module: {
      loaders: [
        {test: /\.css$/, loader: "style!css"}
      ],
      loaders: [
        {test: /\.scss$/, loader: "style!css!sass"}
      ]
    },
};

options.target = webpackTargetElectronRenderer(options);

module.exports = options;