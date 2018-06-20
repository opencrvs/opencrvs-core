import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT } from './constants'
import authenticateHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from './features/authenticate/handler'
import verifyCodeHandler, {
  requestSchema as reqVerifySchema,
  responseSchma as resVerifySchema
} from './features/verifyCode/handler'
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

// curl -H 'Content-Type: application/json' -d '{"mobile": "27845829934", "password": "test"}' http://localhost:4040/authenticate
server.route({
  method: 'POST',
  path: '/authenticate',
  handler: authenticateHandler,
  options: {
    tags: ['api'],
    description: 'Authenticate with username and password',
    notes:
      'Authenticates user and returns nonce to use for collating the login for 2 factor authentication',
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

// curl -H 'Content-Type: application/json' -d '{"code": "123456"}' http://localhost:4040/verifyCode
server.route({
  method: 'POST',
  path: '/verifyCode',
  handler: verifyCodeHandler,
  options: {
    tags: ['api'],
    description: 'Verify the 2 factor auth code',
    notes:
      'Verifies the 2 factor auth code and returns the JWT API token for future requests',
    validate: {
      payload: reqVerifySchema
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          200: { description: 'Code is valid' },
          400: { description: 'Code is invalid' }
        }
      }
    },
    response: {
      schema: resVerifySchema
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
