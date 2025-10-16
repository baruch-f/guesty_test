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
    port: 3001,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].[contenthash].js',
    clean: true,
    publicPath: isProduction
      ? `https://${cloudfrontDomain}/remote-users/`
      : 'auto',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../shared/src'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ]
          }
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new Dotenv({ path: '../../.env' }),
    new ModuleFederationPlugin({
      name: 'remoteUsers',
      filename: 'remoteEntry.js',
      exposes: {
        './UsersApp': './src/UsersApp',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
          eager: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
          eager: false,
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