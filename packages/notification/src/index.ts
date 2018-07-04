// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires

import * as Hapi from 'hapi'

import { HOST, PORT } from './constants'
import smsHandler, { requestSchema } from './features/sms/handler'
import getPlugins from './config/plugins'

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

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

  await server.register(getPlugins())

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
