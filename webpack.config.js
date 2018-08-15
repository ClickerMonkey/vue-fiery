var webpack = require('webpack');
var path = require('path')

module.exports = {
  entry: './src/index.ts',
  output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'vue-fiery.js',
      library: 'VueFiery',
      libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  ts: {
    logLevel: 'warn',
    appendTsSuffixTo: [/\.vue$/]
  },
  vue: {
    // vue-loader options go here
    esModule: true
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['', '.js', '.ts']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  ])
}
