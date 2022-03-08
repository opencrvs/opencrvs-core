import * as Hapi from '@hapi/hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@webhooks/constants'
import getPlugins from '@webhooks/config/plugins'
import * as database from '@webhooks/database'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'
import { getRoutes } from '@webhooks/config/routes'
import * as queue from '@webhooks/queue'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

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
      audience: 'opencrvs:webhooks-user'
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

  async function start() {
    await server.start()
    await database.start()
    await queue.startQueue()
    server.log('info', `server started on ${HOST}:${PORT}`)
  }

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'server stopped')
  }

  return { server, start, stop }
}
