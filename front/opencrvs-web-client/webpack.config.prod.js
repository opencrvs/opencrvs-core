const { resolve } = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: '../src/index.js',
    output: {
      filename: 'static/js/bundle.[name].[chunkhash].js',
      path: resolve(__dirname, 'build/'),
      publicPath: 'http://46.101.36.211/',
    },
    context: resolve(__dirname, 'src'),
    resolve: {
      modules: ['./src', './node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.js?$/, 
          exclude: /node_modules/, 
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react', 'stage-0'],
            cacheDirectory: true, 
          },
        },
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: 'eslint-loader',
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  importLoaders: 1,
                  localIdentName: '[path][name]__[local]__[hash:base64:5]',
                },
              },
              'postcss-loader',
            ],
          }),
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'url-loader',
          options: {
            limit: 1000, 
            name: '[path][name].[hash].[ext]',
          },
        },
      ],
    },

    plugins: [
      new ExtractTextPlugin( {
        filename: 'static/css/style.[chunkhash].css',
        publicPath: 'http://46.101.36.211/',
        allChunks: true,
      }),
      new HtmlWebpackPlugin( {
        template: './index.html',
      }),
      new CopyWebpackPlugin([{from: 'static/img', to: 'static/img'}]),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        },
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true,
        },
        compress: {
          screw_ie8: true,
        },
        comments: false,
      }),
    ],
    
};