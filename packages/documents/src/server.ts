/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import * as Hapi from '@hapi/hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  DEFAULT_TIMEOUT
} from '@documents/constants'
import getPlugins from '@documents/config/plugins'
import { getRoutes } from '@documents/config/routes'
import { readFileSync } from 'fs'
import { MINIO_HOST, MINIO_PORT } from '@documents/minio/constants'
import {
  defaultMinioBucketExists,
  createDefaultMinioBucket
} from '@documents/minio/client'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800, timeout: DEFAULT_TIMEOUT }
    }
  })

  await server.register(getPlugins())

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:documents-user'
    },
    validate: () => ({
      isValid: true
    })
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope?: any }, h) {
      if (request.payload) {
        request.sentryScope?.setExtra('payload', request.payload)
      }
      return h.continue
    }
  })

  async function start() {
    try {
      const bucketExists = await defaultMinioBucketExists()
      if (!bucketExists) {
        await createDefaultMinioBucket()
      }
      server.log('info', `Minio started on ${MINIO_HOST}:${MINIO_PORT}`)
      await server.start()
      server.log('info', `Documents server started on ${HOST}:${PORT}`)
    } catch (error) {
      server.log('info', `Error creating Minio Bucket! ${error.stack}`)
      throw error
    }
  }

  async function stop() {
    await server.stop()
    server.log('info', 'Documents server stopped')
  }

  return { server, start, stop }
}
