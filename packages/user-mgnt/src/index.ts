// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'

import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from './constants'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from './features/verifyPassword/handler'
import getUserMobile, {
  requestSchema as userIdSchema,
  responseSchema as resMobileSchema
} from './features/getUserMobile/handler'
import getPlugins from './config/plugins'
import * as database from './database'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'

const enum RouteScope {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify',
  PERFORMANCE = 'performance'
}

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

  await server.register(getPlugins())

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:user-mgnt-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  // curl -H 'Content-Type: application/json' -d '{"mobile": "27855555555", "password": "test"}' http://localhost:3030/verifyPassword
  server.route({
    method: 'POST',
    path: '/verifyPassword',
    handler: verifyPassHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Verify user password',
      notes: 'Verify account exist and password is correct',
      validate: {
        payload: reqAuthSchema
      },
      response: {
        schema: resAuthSchema
      }
    }
  })

  // Temporary route for testing authentication
  server.route({
    method: 'GET',
    path: '/check-token',
    handler: (request: Hapi.Request) => request.auth.credentials
  })

  server.route({
    method: 'POST',
    path: '/getUserMobile',
    handler: getUserMobile,
    options: {
      tags: ['api'],
      description: 'Retrieves a user mobile number',
      auth: {
        scope: [
          RouteScope.DECLARE,
          RouteScope.REGISTER,
          RouteScope.CERTIFY,
          RouteScope.PERFORMANCE
        ]
      },
      validate: {
        payload: userIdSchema
      },
      response: {
        schema: resMobileSchema
      }
    }
  })

  async function start() {
    await server.start()
    await database.start()
    server.log('info', `server started on ${HOST}:${PORT}`)
  }

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
