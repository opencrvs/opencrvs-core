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
import { DEFAULT_TIMEOUT } from '@config/config/constants'
import getRoutes from '@config/config/routes'
import getPlugins from '@config/config/plugins'
import * as database from '@config/config/database'
import * as mongoDirect from '@config/config/hearthClient'
import { validateFunc, logger } from '@opencrvs/commons'
import { readFileSync } from 'fs'
import { badRequest } from '@hapi/boom'
import { env } from './environment'

export const publicCert = readFileSync(env.CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  let whitelist: string[] = [env.DOMAIN]
  if (env.DOMAIN[0] !== '*') {
    whitelist = [env.LOGIN_URL, env.CLIENT_APP_URL]
  }
  logger.info(`Whitelist: ${JSON.stringify(whitelist)}`)
  const server = new Hapi.Server({
    host: env.HOST,
    port: env.PORT,
    routes: {
      cors: { origin: whitelist },
      validate: {
        failAction: async (_, _2, err) => {
          if (process.env.NODE_ENV === 'production') {
            // In prod, log a limited error message and throw the default Bad Request error.
            logger.error(`ValidationError: ${err?.message}`)
            throw badRequest(`Invalid request payload input`)
          } else {
            // During development, log and respond with the full error.
            logger.error(err?.message)
            throw err
          }
        }
      },
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
      validateFunc(payload, request, env.CHECK_INVALID_TOKEN, env.AUTH_URL)
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
    await mongoDirect.stop()
    server.log('info', 'Config server stopped')
  }

  async function start() {
    await server.start()
    await database.start()
    await mongoDirect.start()
    server.log('info', `Config server started on ${env.HOST}:${env.PORT}`)
  }

  return { server, start, stop }
}
