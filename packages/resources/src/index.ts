// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
// tslint:enable no-var-requires

import * as Hapi from 'hapi'
import { readFileSync } from 'fs'
import getPlugins from '@resources/config/plugins'
import {
  RESOURCES_HOST,
  RESOURCES_PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@resources/constants'
import { validateFunc } from '@opencrvs/commons'

import locationsHandler from '@resources/features/administrative/handler'
import facilitiesHandler from '@resources/features/facilities/handler'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: RESOURCES_HOST,
    port: RESOURCES_PORT,
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
      audience: 'opencrvs:resources-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  server.route({
    method: 'GET',
    path: '/locations',
    handler: locationsHandler,
    options: {
      tags: ['api'],
      description: 'Returns locations.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/facilities',
    handler: facilitiesHandler,
    options: {
      tags: ['api'],
      description: 'Returns facilities.json'
    }
  })

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    server.log('info', `server started on ${RESOURCES_HOST}:${RESOURCES_PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
