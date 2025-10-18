const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const Dotenv = require('dotenv-webpack');

const isProduction = process.env.NODE_ENV === 'production';
const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;

module.exports = {
  entry: './src/index.tsx',
  mode: isProduction ? 'production' : 'development',
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    clean: true,
    publicPath: isProduction 
      ? `https://${cloudfrontDomain}/host/` 
      : 'auto',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new Dotenv({ignoreStub: true}),
    new ModuleFederationPlugin({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        remoteUsers: isProduction
          ? `remoteUsers@https://${cloudfrontDomain}/remote-users/remoteEntry.js`
          : 'remoteUsers@http://localhost:3001/remoteEntry.js',
        remoteStatistic: isProduction
          ? `remoteStatistic@https://${cloudfrontDomain}/remote-statistic/remoteEntry.js`
          : 'remoteStatistic@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
          eager: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
          eager: true,
        },
        'react-i18next': {
          singleton: true,
          requiredVersion: '^14.0.1',
        },
        i18next: {
          singleton: true,
          requiredVersion: '^23.10.1',
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};