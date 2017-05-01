module.exports = {
  entry: './src/index.js',
  output: { path: './lib/', filename: 'bundle.js' },
  module: {
    loaders: [{
      test: /.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'react']
      }
    }]
  },
};
