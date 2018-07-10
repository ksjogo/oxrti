var path = require('path');
module.exports = {
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
