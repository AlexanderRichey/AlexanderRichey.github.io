var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');


module.exports = {
    context: __dirname + "/javascripts",
    entry: "./main",
    output: {
        path: __dirname + "/dist",
        filename: "scripts.js"
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        },
        {
          test: /\.css$|\.scss$/,
          loader: ExtractTextPlugin.extract('css-loader!sass-loader')
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new ExtractTextPlugin({
        filename: 'styles.css',
        allChunks: true
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          screw_ie8: true
        },
        comments: false
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$|\.ttf$/,
        threshold: 10240,
        minRatio: 0.8
      })
    ],
    resolve: {
      extensions: ['.js']
    }
};
