/* eslint quote-props:0 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: false,
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    './src/index.js',
    './stylesheets/app.less',
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      '__DEV__': false,
    }),
    new ExtractTextPlugin('styles.css'),
    new CopyWebpackPlugin([
      { from: 'img', to: 'img' },
      { from: 'favicons', to: '.' },
    ]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
        screw_ie8: true,
      },
    }),
    new webpack.NoErrorsPlugin(),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
        loader: 'babel',
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!less?sourceMap'),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
    ],
  },

  // For XLSX
  // https://github.com/SheetJS/js-xlsx/issues/285#issuecomment-160305339
  node: {
    fs: 'empty',
  },
  externals: [
    {
      './cptable': 'var cptable',
    },
  ],
};
