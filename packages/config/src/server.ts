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
  PORT,
  HOST,
  CHECK_INVALID_TOKEN,
  CERT_PUBLIC_KEY_PATH,
  AUTH_URL,
  HOSTNAME,
  DEFAULT_TIMEOUT
} from '@config/config/constants'
import getRoutes from '@config/config/routes'
import getPlugins from '@config/config/plugins'
import * as database from '@config/config/database'
import { validateFunc } from '@opencrvs/commons'
import { readFileSync } from 'fs'
import { logger } from '@config/logger'

export const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  let whitelist: string[] = [HOSTNAME]
  if (HOSTNAME[0] !== '*') {
    whitelist = [`https://login.${HOSTNAME}`, `https://register.${HOSTNAME}`]
  }
  logger.info(`Whitelist: : ${JSON.stringify(whitelist)}`)
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: whitelist },
      payload: { maxBytes: 52428800, timeout: DEFAULT_TIMEOUT }
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
    method(request: Hapi.Request & { sentryScope?: any }, h) {
      request.sentryScope?.setExtra('payload', request.payload)
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
