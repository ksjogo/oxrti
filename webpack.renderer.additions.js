var path = require('path');
console.log(JSON.stringify(process.env, null, 2))
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
