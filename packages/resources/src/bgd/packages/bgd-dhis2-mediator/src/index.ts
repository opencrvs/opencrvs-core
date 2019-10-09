// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  RUN_AS_MEDIATOR,
  OPENHIM_URL,
  OPENHIM_USER,
  OPENHIM_PASSWORD,
  TRUST_SELF_SIGNED,
  MEDIATOR_URN
} from '@search/constants'
import getPlugins from '@search/config/plugins'
import { getRoutes } from '@search/config/routes'
import { readFileSync } from 'fs'
import * as utils from 'openhim-mediator-utils'
// tslint:disable-next-line:no-relative-imports TODO fix
import { validateFunc } from '../../../../../../commons'

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
      issuer: 'opencrvs:auth-service'
      // audience: 'opencrvs:bgd-dhis2-integration-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  async function start() {
    if (RUN_AS_MEDIATOR === 'true') {
      await new Promise((resolve, reject) => {
        utils.registerMediator(
          {
            apiURL: OPENHIM_URL,
            username: OPENHIM_USER,
            password: OPENHIM_PASSWORD,
            trustSelfSigned: TRUST_SELF_SIGNED === 'true'
          },
          {
            urn: MEDIATOR_URN,
            version: '1.0.0',
            name: 'OpenCRVS DHIS2 Mediator',
            endpoints: [
              {
                name: 'OpenCRVS DHIS Mediator',
                host: HOST,
                port: 8040
              }
            ]
          },
          (err: Error) => (err ? reject(err) : resolve())
        )
      })

      utils.activateHeartbeat({
        apiURL: OPENHIM_URL,
        username: OPENHIM_USER,
        password: OPENHIM_PASSWORD,
        trustSelfSigned: TRUST_SELF_SIGNED === 'true',
        urn: MEDIATOR_URN
      })
    }

    await server.start()
    server.log('info', `Search server started on ${HOST}:${PORT}`)
  }

  async function stop() {
    await server.stop()
    server.log('info', 'Search server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
