// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
// tslint:enable no-var-requires

import * as Hapi from 'hapi'
import getPlugins from './config/plugins'
import { RESOURCES_HOST, RESOURCES_PORT } from './constants'

import locationsHandler from './features/administrative/handler'
import facilitiesHandler from './features/facilities/handler'

export async function createServer() {
  const server = new Hapi.Server({
    host: RESOURCES_HOST,
    port: RESOURCES_PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

  server.route({
    method: 'GET',
    path: '/locations',
    handler: locationsHandler,
    options: {
      tags: ['api'],
      description: 'Returns locations.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/facilities',
    handler: facilitiesHandler,
    options: {
      tags: ['api'],
      description: 'Returns facilities.json',
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'facilities JSON returned' },
            400: { description: 'facilities JSON error' }
          }
        }
      }
    }
  })

  await server.register(getPlugins())

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    server.log('info', `server started on ${RESOURCES_HOST}:${RESOURCES_PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
