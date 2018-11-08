var webpack = require("webpack");
var path = require("path");

var BUILD_DIR = path.resolve(__dirname, "/build");
var APP_DIR = path.resolve(__dirname, "/src");

var config = {
  entry: {
    trade: APP_DIR + '/index.jsx',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: "babel-loader"
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: "bundle_[name].js"
  }
};

module.exports = config;
