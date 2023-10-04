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
import { getPlugins } from '@gateway/config/plugins'
import { getRoutes } from '@gateway/config/routes'
import {
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  PORT,
  HOST,
  HOSTNAME,
  DEFAULT_TIMEOUT
} from '@gateway/constants'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'
import {
  ApolloServer,
  ApolloServerPluginStopHapiServer
} from 'apollo-server-hapi'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { getApolloConfig } from '@gateway/graphql/config'
import * as database from '@gateway/features/user/database'
import { logger } from '@gateway/logger'
import { badRequest, Boom } from '@hapi/boom'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  let whitelist: string[] = [HOSTNAME]
  if (HOSTNAME[0] !== '*') {
    whitelist = [`https://login.${HOSTNAME}`, `https://register.${HOSTNAME}`]
  }
  logger.info(`Whitelist: ${JSON.stringify(whitelist)}`)
  const app = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: whitelist },
      validate: {
        failAction: async (_, _2, err: Boom) => {
          if (process.env.NODE_ENV === 'production') {
            // In prod, log a limited error message and throw the default Bad Request error.
            logger.error(`ValidationError: ${err.message}`)
            throw badRequest(`Invalid request payload input`)
          } else {
            // During development, log and respond with the full error.
            logger.error(err.message)
            throw err
          }
        }
      },
      payload: { maxBytes: 52428800, timeout: DEFAULT_TIMEOUT }
    }
  })
  const plugins = getPlugins()

  await app.register(plugins)

  const apolloServer = new ApolloServer({
    ...getApolloConfig(),
    plugins: [
      ApolloServerPluginStopHapiServer({ hapiServer: app }),
      ApolloServerPluginLandingPageGraphQLPlayground()
    ]
  })
  app.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  app.auth.default('jwt')

  const routes = getRoutes()
  app.route(routes)

  /*
   * For debugging sent declarations on pre-prod environments.
   * Custom implementation a sGood doesn't support logging request payloads
   * https://github.com/hapijs/good/search?q=request&type=Issues
   */
  if (process.env.NODE_ENV !== 'production') {
    app.events.on('response', (request) => {
      app.log('info', JSON.stringify(request.payload))
    })
  }

  async function start() {
    await apolloServer.start()
    await app.start()
    await database.start()
    await apolloServer.applyMiddleware({
      app,
      route: {
        auth: {
          mode: 'try'
        }
      },
      cors: {
        origin: whitelist
      }
    })
    app.log('info', `server started on port ${PORT}`)
  }

  async function stop() {
    await app.stop()
    await database.stop()
    app.log('info', 'server stopped')
  }

  return { app, start, stop }
}
