const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.mjs', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output bundle file
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Path to your existing index.html
      filename: 'index.html', // Output file name (remains index.html)
    }),
  ],
  
  module: {
    rules: [
      {
        test: /\.js$/, // Use Babel for .js files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // Preset used for env setup
          },
        },
      },
      // Rule for CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Optionally, add a rule for SCSS files
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // Add loaders for images here as needed
    ],
  },
};