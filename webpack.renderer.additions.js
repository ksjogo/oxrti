var path = require('path');
module.exports = {
  devtool: 'cheap-module-eval-source-map',
  output: {
    sourceMapFilename: "[file].map?[contenthash]"
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'src', 'loaders')]
  },
  module: {
    rules: [
      {
        test: /\.glsl$/,
        use: 'glslify-loader'
      }
    ]
  }
}
