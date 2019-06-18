// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires

import * as Hapi from 'hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@notification/constants'
import getPlugins from '@notification/config/plugins'
import { readFileSync } from 'fs'
import getRoutes from '@notification/config/routes'
import { validateFunc } from '@opencrvs/commons'

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
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

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
