const project = require('../config/project.config')
const server = require('../server/hapi')
const debug = require('debug')('app:bin:dev-server')

server.START()
debug(`Server is now running at http://localhost:${project.server_port}.`)
