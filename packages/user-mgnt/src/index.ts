// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'

import {
<<<<<<< HEAD
  AUTH_HOST,
  AUTH_PORT,
  CERT_PUBLIC_KEY_PATH
} from '@user-mgnt/constants'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from '@user-mgnt/features/verifyPassword/handler'
import getUserMobile, {
  requestSchema as userIdSchema,
  responseSchema as resMobileSchema
} from '@user-mgnt/features/getUserMobile/handler'
import getPlugins from '@user-mgnt/config/plugins'
import * as database from '@user-mgnt/database'
=======
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from 'src/constants'
import getPlugins from 'src/config/plugins'
import * as database from 'src/database'
>>>>>>> master
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'
import { getRoutes } from 'src/config/routes'

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
  const routes = getRoutes()
  server.route(routes)

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
