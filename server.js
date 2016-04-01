const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')

const settings = {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  stats: { colors: true },
}

const server = new WebpackDevServer(webpack(config), settings)

server.listen(3000, 'localhost', (err, result) => {
  if (err) return console.log(err)
  console.log('Listening at http://localhost:3000/')
})
