var path = require('path');
var webpack = require('webpack');

module.exports = (env, argv) => {
  let productionP = argv.mode === 'production'
  return {
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
  };
}