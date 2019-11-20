/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))
// tslint:enable no-var-requires

import * as Hapi from 'hapi'
import { readFileSync } from 'fs'
import getPlugins from '@resources/config/plugins'
import * as usrMgntDB from '@resources/database'
import {
  RESOURCES_HOST,
  RESOURCES_PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL
} from '@resources/constants'
import { validateFunc } from '@opencrvs/commons'
import {
  locationsHandler as bgdLocationsHandler,
  nidVerificationHandler as bgdNidVerificationHandler,
  nidVerificationReqSchema as bgdNidVerificationReqSchema,
  nidResponseSchema as bgdNidResponseSchema
} from '@resources/bgd/features/administrative/handler'
import { facilitiesHandler as bgdFacilitiesHandler } from '@resources/bgd/features/facilities/handler'
import { definitionsHandler as bgdDefinitionsHandler } from '@resources/bgd/features/definitions/handler'
import { assetHandler as bgdAssetHandler } from '@resources/bgd/features/assets/handler'
import {
  generatorHandler as bgdGeneratorHandler,
  requestSchema as bgdGeneratorRequestSchema,
  responseSchema as bgdGeneratorResponseSchema
} from '@resources/bgd/features/generate/handler'
import { locationsHandler as zmbLocationsHandler } from '@resources/zmb/features/administrative/handler'
import { facilitiesHandler as zmbFacilitiesHandler } from '@resources/zmb/features/facilities/handler'
import { definitionsHandler as zmbDefinitionsHandler } from '@resources/zmb/features/definitions/handler'
import { assetHandler as zmbAssetHandler } from '@resources/zmb/features/assets/handler'
import {
  generatorHandler as zmbGeneratorHandler,
  requestSchema as zmbGeneratorRequestSchema,
  responseSchema as zmbGeneratorResponseSchema
} from '@resources/zmb/features/generate/handler'

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
    handler: bgdAssetHandler,
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
    handler: bgdGeneratorHandler,
    options: {
      tags: ['api'],
      validate: {
        payload: bgdGeneratorRequestSchema
      },
      response: {
        schema: bgdGeneratorResponseSchema
      },
      description:
        'Generates registration numbers based on country specific implementation logic'
    }
  })

  server.route({
    method: 'POST',
    path: '/verify/nid/bgd',
    handler: bgdNidVerificationHandler,
    options: {
      tags: ['api'],
      validate: {
        payload: bgdNidVerificationReqSchema
      },
      response: {
        schema: bgdNidResponseSchema
      },
      description: 'Verify NID for Bangladesh'
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
    handler: zmbAssetHandler,
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
    handler: zmbGeneratorHandler,
    options: {
      tags: ['api'],
      validate: {
        payload: zmbGeneratorRequestSchema
      },
      response: {
        schema: zmbGeneratorResponseSchema
      },
      description:
        'Generates registration numbers based on country specific implementation logic'
    }
  })

  async function stop() {
    await server.stop()
    await usrMgntDB.disconnect()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    await usrMgntDB.connect()
    server.log('info', `server started on ${RESOURCES_HOST}:${RESOURCES_PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
