// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'

import { AUTH_HOST, AUTH_PORT, CERT_PUBLIC_KEY_PATH } from './constants'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from './features/verifyPassword/handler'
import getPlugins from './config/plugins'
import * as database from './database'
import { readFileSync } from 'fs'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: AUTH_HOST,
    port: AUTH_PORT,
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
    validate: (payload: any, request: any) => ({
      isValid: true,
      credentials: payload
    })
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

  // Temporary route for testing authentication
  server.route({
    method: 'GET',
    path: '/check-token',
    handler: (request: Hapi.Request) => request.auth.credentials
  })

  async function start() {
    await server.start()
    await database.start()
    server.log('info', `server started on ${AUTH_HOST}:${AUTH_PORT}`)
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
