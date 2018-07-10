var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');

module.exports = (env, argv) => {
  let productionP = argv.mode === 'production'
  // merge the additional electron-webpack config back in
  let config = webpackMerge({
    mode: !productionP ? 'development' : 'production',
    entry: !productionP ? [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      './src/web/index'
    ] : [
        './src/web/index'
      ],
    plugins:
      !productionP ? [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.SourceMapDevToolPlugin({
          filename: '[name].map'
        })
      ] : [
          new webpack.NoEmitOnErrorsPlugin(),
        ],
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/static/'
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: true,
                // this could be unneccessary with our stateless react architechture, need to verify
                plugins: !productionP ? ['react-hot-loader/babel'] : [],
              },
            },
            {
              loader: "awesome-typescript-loader"
            },
          ],
          include: path.join(__dirname, 'src')
        }, {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        }, {
          test: /\.(gif|png|jpe?g|svg)$/i,
          loaders: ["base64-image-loader"]
        }
      ]
    }
  }, require('./webpack.renderer.additions'));
  return config;
}