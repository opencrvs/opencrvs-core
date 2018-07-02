// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'
import * as mongoose from 'mongoose'

import { AUTH_HOST, AUTH_PORT, MONGO_URL } from './constants'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from './features/verifyPassword/handler'
import getPlugins from './config/plugins'

mongoose.connect(MONGO_URL)

export async function createServer() {
  const server = new Hapi.Server({
    host: AUTH_HOST,
    port: AUTH_PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

  async function init() {
    await server.register(getPlugins())
  }

  // curl -H 'Content-Type: application/json' -d '{"mobile": "27855555555", "password": "test"}' http://localhost:3030/verifyPassword
  server.route({
    method: 'POST',
    path: '/verifyPassword',
    handler: verifyPassHandler,
    options: {
      tags: ['api'],
      description: 'Verify user password',
      notes: 'Verify account exist and password is correct',
      validate: {
        payload: reqAuthSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'User details are correct' },
            400: { description: 'User details are incorrect' }
          }
        }
      },
      response: {
        schema: resAuthSchema
      }
    }
  })

  async function start() {
    await init()
    await server.start()
    server.log('info', `server started on ${AUTH_HOST}:${AUTH_PORT}`)
  }

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
