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

import { ApolloServer, BaseContext } from '@apollo/server'
import { getPlugins } from '@gateway/config/plugins'
import { getRoutes } from '@gateway/config/routes'
import {
  AUTH_URL,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  CLIENT_APP_URL,
  DEFAULT_TIMEOUT,
  HOST,
  HOSTNAME,
  LOGIN_URL,
  PORT
} from '@gateway/constants'
import * as Hapi from '@hapi/hapi'
import { logger, validateFunc } from '@opencrvs/commons'
import { readFileSync } from 'fs'

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import hapiApollo from '@as-integrations/hapi'
import { getApolloConfig } from '@gateway/graphql/config'
import * as database from '@gateway/utils/redis'
import { badRequest, Boom, isBoom } from '@hapi/boom'
import { Context } from './graphql/context'
import { RateLimitError } from './rate-limit'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  let whitelist: string[] = [HOSTNAME]
  if (HOSTNAME[0] !== '*') {
    whitelist = [LOGIN_URL, CLIENT_APP_URL]
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

  const apolloServer = new ApolloServer<BaseContext>({
    ...getApolloConfig(),
    plugins: [ApolloServerPluginLandingPageLocalDefault({ footer: false })]
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

  app.ext('onRequest', (req, h) => {
    if (req.url.pathname.startsWith('/v1')) {
      req.url.pathname = req.url.pathname.replace('/v1', '')
      req.setUrl(req.url)
    }
    return h.continue
  })

  app.ext('onPreResponse', (request, reply) => {
    if (!isBoom(request.response)) {
      request.response.header('access-control-expose-headers', 'X-Version', {
        append: true
      })
      request.response.header(
        'X-Version',
        String(process.env.npm_package_version)
      )
    }

    if (request.response instanceof RateLimitError) {
      return reply
        .response({
          statusCode: 402,
          error: 'Rate limit exceeded',
          message: request.response.message
        })
        .code(402)
    }

    return reply.continue
  })

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

    await app.register({
      plugin: hapiApollo,
      options: {
        path: '/graphql',
        postRoute: {
          options: {
            auth: {
              strategy: 'jwt',
              mode: 'try'
            }
          }
        },
        getRoute: {
          options: {
            auth: {
              strategy: 'jwt',
              mode: 'try'
            }
          }
        },
        context: async ({ request }) => new Context(request),
        apolloServer
      }
    })

    await app.start()
    await database.start()
    app.log('info', `server started on port ${PORT}`)
  }

  async function stop() {
    await app.stop()
    await database.stop()
    app.log('info', 'server stopped')
  }

  return { app, start, stop }
}
