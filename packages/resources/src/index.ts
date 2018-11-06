// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires

import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT } from './constants'
import administrativeStructureHandler, {
  requestSchema as administrativeStructureRequestSchema
} from './features/administrative/handler'
import getPlugins from './config/plugins'

export async function createServer() {
  const server = new Hapi.Server({
    host: AUTH_HOST,
    port: AUTH_PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })
  server.route({
    method: 'GET',
    path: '/administrative_structure/{divisionType}',
    handler: administrativeStructureHandler,
    options: {
      tags: ['api'],
      description: 'Load the administrative structure',
      notes: 'Loads the administrative structure JSON',
      validate: {
        payload: administrativeStructureRequestSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'Successfully loaded' },
            400: { description: 'Cannot load' }
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
    server.log('info', `server started on ${AUTH_HOST}:${AUTH_PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
