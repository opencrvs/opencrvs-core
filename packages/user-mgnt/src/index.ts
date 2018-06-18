import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT } from './constants'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from './features/verifyPassword/handler'
import getPlugins from './config/plugins'

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

// curl -H 'Content-Type: application/json' -d '{"mobile": "27845829934", "password": "test"}' http://localhost:3030/verifyPassword
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

export async function start() {
  await init()
  await server.start()
  server.log('info', `server started on ${AUTH_HOST}:${AUTH_PORT}`)
}

export async function stop() {
  await server.stop()
  server.log('info', 'server stopped')
}

if (!module.parent) {
  start()
}
