// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires

import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT } from './constants'
import administrativeStructureHandler from './features/administrative/handler'
import getPlugins from './config/plugins'

export async function createServer() {
  const server = new Hapi.Server({
    host: AUTH_HOST,
    port: AUTH_PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

  // curl -H 'Content-Type: application/json' -d '{"nonce": "", "token": ""}' http://localhost:4040/refreshToken
  server.route({
    method: 'GET',
    path: '/administrative_structure',
    handler: administrativeStructureHandler,
    options: {
      tags: ['api'],
      description: 'Import the administrative structure',
      notes:
        'Connects to the 3rd party API to retrieve and format administrative structure into FHIR',
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'Successfully imported' },
            400: { description: 'Cannot import' }
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
