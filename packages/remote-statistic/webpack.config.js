const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  devServer: {
    port: 3002,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: 'auto',
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
    new ModuleFederationPlugin({
      name: 'remoteStatistic',
      filename: 'remoteEntry.js',
      exposes: {
        './StatisticApp': './src/StatisticApp',
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