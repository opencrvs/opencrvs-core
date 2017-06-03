const { resolve } = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  return {
    entry: '../src/index.js',
    output: {
      filename: 'static/js/bundle.[name].[chunkhash].js',
      path: resolve(__dirname, 'build/'),
      pathinfo: !env.prod,
    },
    context: resolve(__dirname, 'src'),
    devtool: env.prod ? 'source-map' : 'eval',
    bail: env.prod,
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
                  localIdentName: '[name]__[local]__[hash:base64:5]',
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
            name: 'static/img/[hash].[ext]',
          },
        },
        { 
          test: /\.(png|jpg)$/,
          loader: 'file-loader'
        },
      ],
    },

    plugins: [
      new ExtractTextPlugin( {
        filename: 'static/css/style.[chunkhash].css',
        publicPath: 'static/css/',
        allChunks: true,
      }),
      new HtmlWebpackPlugin( {
        template: './index.html',
      }),
    ],
    devServer: {
      contentBase: resolve(__dirname, 'build/'),
      host: 'localhost',
      port: 3000,
      historyApiFallback: true,
      stats: 'minimal',
    },
    
  };
};