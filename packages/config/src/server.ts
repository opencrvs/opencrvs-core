import * as Hapi from '@hapi/hapi'
import {
  PORT,
  HOST,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@config/config/constants'
import getRoutes from '@config/config/routes'
import getPlugins from '@config/config/plugins'
import * as database from '@config/config/database'
import { validateFunc } from '@opencrvs/commons'

import { CERT_PUBLIC_KEY_PATH } from '@config/config/constants'
import { readFileSync } from 'fs'

export const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800 }
    }
  })

  await server.register(getPlugins())

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:config-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope: any }, h) {
      request.sentryScope.setExtra('payload', request.payload)
      return h.continue
    }
  })

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'Config server stopped')
  }

  async function start() {
    await server.start()
    await database.start()
    server.log('info', `Config server started on ${HOST}:${PORT}`)
  }

  return { server, start, stop }
}
