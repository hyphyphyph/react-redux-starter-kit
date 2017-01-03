const debug = require('debug')('app:server')
const Hapi = require('hapi')
const project = require('../config/project.config')
const webpackConfig = require('../config/webpack.config')

debug('Using Hapi')

const server = new Hapi.Server()
server.connection({
  port: project.server_port
})

if (project.env === 'development') {
  debug('Enabling webpack dev and HMR middleware')

  server.register({
    register: require('hapi-webpack-dev-middleware'),
    options: {
      config: webpackConfig,
      options: {
        publicPath  : webpackConfig.output.publicPath,
        contentBase : project.paths.client(),
        hot         : true,
        quiet       : project.compiler_quiet,
        noInfo      : project.compiler_quiet,
        lazy        : false,
        stats       : project.compiler_stats
      }
    }
  })

  server.register({
    register: require('hapi-webpack-hot-middleware'),
    options: {
      path: '/__webpack_hmr'
    }
  })

  server.register(
    require('inert'),
    (err) => {
      if (err) {
        throw err
      }

      server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: project.paths.public(),
            listing: true
          }
        }
      })
    }
  )
}
else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  server.register(
    require('inert'),
    (err) => {
      if (err) {
        throw err
      }

      server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: project.paths.dist(),
            listing: true
          }
        }
      })
    }
  )
}

module.exports = server
module.exports.START = () => {
  server.start((err) => {
    if (err) {
      throw err;
    }
  })
}
