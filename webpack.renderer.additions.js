var webpackMerge = require('webpack-merge');
module.exports = webpackMerge({
  devtool: 'cheap-module-eval-source-map',
  output: {
    sourceMapFilename: "[file].map?[contenthash]"
  }
}, require('./webpack.renderer.shared'))