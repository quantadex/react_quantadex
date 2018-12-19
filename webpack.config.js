var webpack = require("webpack");
var path = require("path");

var BUILD_DIR = path.resolve(__dirname, "public/build");
var APP_DIR = path.resolve(__dirname, "src");

var config = {
  entry: {
    trade: ["babel-polyfill", APP_DIR + '/index.jsx'],
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000
  },

  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: "babel-loader"
      },
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: "bundle_[name].js"
  }
};

module.exports = config;
