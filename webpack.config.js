const path = require('path');

module.exports = {
  context: __dirname,
  entry: "./descriptor.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "descriptor.js",
    library: 'descriptor',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          presets: ["env"]
        }
      },
      {
        test: /\.pegjs$/,
        use: 'raw-loader'
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  }
}
