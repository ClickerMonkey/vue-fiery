const path = require('path')

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  output: {
    filename: 'vue-fiery.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'VueFiery',
    libraryTarget: 'umd',
    libraryExport: 'default'
  }
};
