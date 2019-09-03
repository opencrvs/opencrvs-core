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
import { locationsHandler as bgdLocationsHandler } from '@resources/bgd/features/administrative/handler'
import { facilitiesHandler as bgdFacilitiesHandler } from '@resources/bgd/features/facilities/handler'
import { definitionsHandler as bgdDefinitionsHandler } from '@resources/bgd/features/definitions/handler'
import { locationsHandler as zmbLocationsHandler } from '@resources/zmb/features/administrative/handler'
import { facilitiesHandler as zmbFacilitiesHandler } from '@resources/zmb/features/facilities/handler'
import { definitionsHandler as zmbDefinitionsHandler } from '@resources/zmb/features/definitions/handler'

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

  // Bangladesh

  server.route({
    method: 'GET',
    path: '/bgd/locations',
    handler: bgdLocationsHandler,
    options: {
      tags: ['api'],
      description: 'Returns Bangladesh locations.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/bgd/facilities',
    handler: bgdFacilitiesHandler,
    options: {
      tags: ['api'],
      description: 'Returns Bangladesh facilities.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/bgd/assets/{file}',
    handler: () => {
      return
    },
    options: {
      tags: ['api'],
      description: 'Serves country specific assets, unprotected'
    }
  })

  server.route({
    method: 'GET',
    path: '/bgd/definitions/{application}',
    handler: bgdDefinitionsHandler,
    options: {
      tags: ['api'],
      description:
        'Serves definitional metadata like form definitions, language files and pdf templates'
    }
  })

  server.route({
    method: 'POST',
    path: '/bgd/generate/{type}',
    handler: () => {
      return
    },
    options: {
      tags: ['api'],
      description:
        'Generates registration numbers based on country specific implementation logic'
    }
  })

  // Zambia

  server.route({
    method: 'GET',
    path: '/zmb/locations',
    handler: zmbLocationsHandler,
    options: {
      tags: ['api'],
      description: 'Returns Bangladesh locations.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/zmb/facilities',
    handler: zmbFacilitiesHandler,
    options: {
      tags: ['api'],
      description: 'Returns Bangladesh facilities.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/zmb/assets/{file}',
    handler: () => {
      return
    },
    options: {
      tags: ['api'],
      description: 'Serves country specific assets, unprotected'
    }
  })

  server.route({
    method: 'GET',
    path: '/zmb/definitions/{application}',
    handler: zmbDefinitionsHandler,
    options: {
      tags: ['api'],
      description:
        'Serves definitional metadata like form definitions, language files and pdf templates'
    }
  })

  server.route({
    method: 'POST',
    path: '/zmb/generate/{type}',
    handler: () => {
      return
    },
    options: {
      tags: ['api'],
      description:
        'Generates registration numbers based on country specific implementation logic'
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
