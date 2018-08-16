// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires

import * as Hapi from 'hapi'

import { HOST, PORT, CERT_PUBLIC_KEY_PATH } from './constants'
import smsHandler, { requestSchema } from './features/sms/handler'
import getPlugins from './config/plugins'
import { readFileSync } from 'fs'

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
      audience: 'opencrvs:notification-user'
    },
    validate: (payload: any, request: any) => ({
      isValid: true,
      credentials: payload
    })
  })

  server.auth.default('jwt')

  // curl -H 'Content-Type: application/json' -d '{"msisdn": "+27855555555", "message": "Test"}' http://localhost:2020/sms
  server.route({
    method: 'POST',
    path: '/sms',
    handler: smsHandler,
    options: {
      tags: ['api'],
      description: 'Sends an sms to a user',
      validate: {
        payload: requestSchema
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'Sms sent' },
            400: { description: 'Bad request, check your request body' }
          }
        }
      }
    }
  })

  async function stop() {
    await server.stop()
    server.log('info', 'Notification server stopped')
  }

  async function start() {
    await server.start()
    server.log('info', `Notification server started on ${HOST}:${PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
