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
require('app-module-path').addPath(require('path').join(__dirname))
require('dotenv').config()
import './monitoring'

import path from 'path'
import * as Hapi from '@hapi/hapi'
import * as Pino from 'hapi-pino'
import * as JWT from 'hapi-auth-jwt2'
import * as inert from '@hapi/inert'
import * as Sentry from 'hapi-sentry'
import fetch from 'node-fetch'
import {
  CLIENT_APP_URL,
  DOMAIN,
  LOGIN_URL,
  SENTRY_DSN,
  COUNTRY_CONFIG_HOST,
  COUNTRY_CONFIG_PORT,
  AUTH_URL,
  DEFAULT_TIMEOUT,
  GATEWAY_URL,
  THIRTY_MINUTES_IN_MILLISECONDS
} from '@countryconfig/constants'
import {
  contentHandler,
  countryLogoHandler
} from '@countryconfig/api/content/handler'
import decode from 'jwt-decode'
import { logger } from '@countryconfig/logger'
import clientConfig from './client-config'
import clientConfigProd from './client-config.prod'
import loginConfig from './login-config'
import loginConfigProd from './login-config.prod'
import { emailHandler, emailSchema } from './api/notification/handler'
import { ErrorContext } from 'hapi-auth-jwt2'
import { mapGeojsonHandler } from '@countryconfig/api/dashboards/handler'
import { locationsHandler } from './data-seeding/locations/handler'
import { certificateHandler } from './api/certificates/handler'
import { rolesHandler } from './data-seeding/roles/handler'
import { usersHandler } from './data-seeding/employees/handler'
import { applicationConfigHandler } from './api/application/handler'
import { handlebarsHandler } from './certificate/handlebars/handler'
import { fontsHandler } from './api/fonts/handler'
import {
  getEventsHandler,
  onAnyActionHandler,
  onCustomActionHandler
} from '@countryconfig/api/events/handler'
import {
  ActionDocument,
  ActionStatus,
  ActionType,
  EventDocument
} from '@opencrvs/toolkit/events'

import { onRegisterHandler } from './api/registration'
import { workqueueconfigHandler } from './api/workqueue/handler'
import getUserNotificationRoutes from './config/routes/userNotificationRoutes'
import {
  importAdministrativeAreas,
  importEvent,
  importEvents,
  importLocations,
  syncLocationLevels,
  syncLocationStatistics
} from './analytics/analytics'
import { getClient } from './analytics/postgres'
import { env } from './environment'
import { createClient } from '@opencrvs/toolkit/api'
import { Event } from './events/utils/types'

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

export default function getPlugins() {
  const plugins: any[] = [inert, JWT]

  if (process.env.NODE_ENV !== 'test') {
    plugins.push({
      plugin: Pino,
      options: {
        prettyPrint: false,
        logPayload: false,
        instance: logger
      }
    })
  }

  if (SENTRY_DSN) {
    plugins.push({
      plugin: Sentry,
      options: {
        client: {
          environment: process.env.NODE_ENV,
          dsn: SENTRY_DSN
        },
        catchLogErrors: true
      }
    })
  }

  return plugins
}

const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}

export function hasScope(token: string, scope: string) {
  const tokenPayload = getTokenPayload(token)
  return (tokenPayload.scope && tokenPayload.scope.indexOf(scope) > -1) || false
}

export const verifyToken = async (token: string, authUrl: string) => {
  const res = await fetch(`${authUrl}/verifyToken`, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const body = await res.json()

  if (body.valid === true) {
    return true
  }

  return false
}

async function getPublicKey(): Promise<string> {
  try {
    const response = await fetch(`${AUTH_URL}/.well-known`)
    return response.text()
  } catch (error) {
    logger.error(
      `Failed to fetch public key from Core. Make sure Core is running, and you are able to connect to ${AUTH_URL}/.well-known.`
    )
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return getPublicKey()
  }
}

export async function createServer() {
  let whitelist: string[] = [DOMAIN]
  if (DOMAIN[0] !== '*') {
    whitelist = [LOGIN_URL, CLIENT_APP_URL]
  }
  logger.info(`Whitelist: ${JSON.stringify(whitelist)}`)
  const server = new Hapi.Server({
    host: COUNTRY_CONFIG_HOST,
    port: COUNTRY_CONFIG_PORT,
    routes: {
      cors: { origin: whitelist },
      timeout: {
        server: DEFAULT_TIMEOUT
      },
      payload: {
        maxBytes: 52428800
      }
    }
  })

  server.listener.requestTimeout = THIRTY_MINUTES_IN_MILLISECONDS

  await server.register(getPlugins())

  let publicKey = await getPublicKey()
  let publicKeyUpdatedAt = Date.now()

  server.auth.strategy('jwt', 'jwt', {
    key: () => ({ key: publicKey }),
    errorFunc: (errorContext: ErrorContext) => {
      /*
       * If an incoming request fails with a 401 Unauthorized, we need to check if the
       * public key we have is still valid. If it is not, we fetch a new one.
       * This is done only once every minute to avoid invalid tokens spamming the server.
       */

      const moreThanAMinuteFromLatestUpdate =
        publicKeyUpdatedAt < Date.now() - 60000
      if (
        errorContext.errorType === 'unauthorized' &&
        moreThanAMinuteFromLatestUpdate
      ) {
        logger.info(
          'Request failed, fetching a new public key. This might either be a client with an outdated token or the server public key being outdated. Trying to update the server public key...'
        )
        getPublicKey()
          .then((newPublicKey) => {
            logger.info('Key fetched, updating')
            publicKeyUpdatedAt = Date.now()
            publicKey = newPublicKey
          })
          .catch((err) => {
            logger.error('Fetching a new public key failed', err)
          })
      }
      return errorContext
    },
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:countryconfig-user'
    },
    validate: (payload: any, request: Hapi.Request) => ({
      isValid: true,
      credentials: payload
    })
  })

  server.auth.default('jwt')

  server.route({
    method: 'GET',
    path: '/certificates/{id}',
    handler: certificateHandler,
    options: {
      tags: ['api', 'certificates'],
      description: 'Returns only one certificate metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/certificates',
    handler: certificateHandler,
    options: {
      tags: ['api', 'certificates'],
      description: 'Returns certificate metadata'
    }
  })

  // add ping route by default for health check
  server.route({
    method: 'GET',
    path: '/ping',
    // eslint-disable-next-line no-unused-vars
    handler: (request: any, h: any) => {
      // Perform any health checks and return true or false for success prop
      return {
        success: true
      }
    },
    options: {
      auth: false,
      tags: ['api'],
      description: 'Health check endpoint'
    }
  })

  server.route({
    method: 'GET',
    path: '/fonts/{filename}',
    handler: fontsHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves available fonts'
    }
  })

  server.route({
    method: 'GET',
    path: '/client-config.js',
    handler: (_request, h) => {
      const config =
        process.env.NODE_ENV === 'production' ? clientConfigProd : clientConfig
      return h
        .response(`window.config = ${JSON.stringify(config)}`)
        .type('application/javascript')
    },
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves client configuration as a static file'
    }
  })

  server.route({
    method: 'GET',
    path: '/login-config.js',
    handler: (_request, h) => {
      const config =
        process.env.NODE_ENV === 'production' ? loginConfigProd : loginConfig
      return h
        .response(`window.config = ${JSON.stringify(config)}`)
        .type('application/javascript')
    },
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves login client configuration as a static file'
    }
  })

  server.route({
    method: 'GET',
    path: '/handlebars.js',
    handler: handlebarsHandler,
    options: {
      auth: false,
      tags: ['api'],
      description:
        'Serves custom handlebar helper functions as JS to be used in certificates'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/{application}',
    handler: contentHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves language content'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/map.geojson',
    handler: mapGeojsonHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves map geojson'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/country-logo',
    handler: countryLogoHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves country logo'
    }
  })

  server.route({
    method: 'POST',
    path: '/email',
    handler: emailHandler,
    options: {
      /*
       * In deployed environments, the email path is blocked by Traefik.
       * See docker-compose.deploy.yml for more details.
       */
      auth: false,
      tags: ['api'],
      validate: {
        payload: emailSchema
      },
      description: 'Handles sending email using a predefined template file'
    }
  })

  server.route({
    method: 'GET',
    path: '/config/application',
    handler: applicationConfigHandler,
    options: {
      auth: false,
      tags: ['api', 'application-config'],
      description: 'Returns default application configuration'
    }
  })

  server.route({
    method: 'GET',
    path: '/config/workqueues',
    handler: workqueueconfigHandler,
    options: {
      auth: false,
      tags: ['api', 'workqueue'],
      description: 'Returns workqueue configurations'
    }
  })

  server.route({
    method: 'GET',
    path: '/config/locations',
    handler: locationsHandler,
    options: {
      auth: false,
      tags: ['api', 'locations'],
      description: 'Returns the locations metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/config/roles',
    handler: rolesHandler,
    options: {
      auth: false,
      tags: ['api', 'user-roles'],
      description: 'Returns user roles metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/config/users',
    handler: usersHandler,
    options: {
      tags: ['api', 'users'],
      description: 'Returns users metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/static/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'client-static'),
        redirectToSlash: true,
        index: false
      }
    },
    options: {
      auth: false,
      tags: ['api', 'static'],
      description: 'Server static files for client'
    }
  })

  server.route({
    method: 'POST',
    path: '/reindex',
    options: {
      /*
       * In deployed environments, the reindex path is blocked by Traefik.
       * See docker-compose.deploy.yml for more details.
       */
      auth: false
    },
    handler: async (req, h) => {
      if (!env.ANALYTICS_DATABASE_URL) {
        logger.warn(
          'Skipping reindex, no ANALYTICS_DATABASE_URL environment variable set.'
        )
        return h.response().code(200)
      }

      const batch = req.payload as EventDocument[]
      const client = getClient()

      try {
        await client.transaction().execute(async (trx) => {
          await importEvents(batch, trx)
        })

        await syncLocations(req)

        logger.info(`Reindexed batch of ${batch.length} events into analytics.`)

        return h.response().code(200)
      } catch (e) {
        logger.error(e)

        return h.response({ error: 'Unexpected error' }).code(500)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/config/events',
    handler: getEventsHandler,
    options: {
      auth: false,
      tags: ['api', 'events'],
      description: 'Serves custom events'
    }
  })

  server.route({
    method: 'POST',
    path: `/trigger/events/{event}/actions/${ActionType.CUSTOM}`,
    handler: onCustomActionHandler,
    options: {
      tags: ['api', 'events'],
      description: 'Receives notifications on event custom action'
    }
  })

  server.route({
    method: 'POST',
    path: '/trigger/events/{event}/actions/{action}',
    handler: onAnyActionHandler,
    options: {
      tags: ['api', 'events'],
      description: 'Receives notifications on event actions'
    }
  })

  server.route({
    method: 'POST',
    path: `/trigger/events/${Event.TENNIS_CLUB_MEMBERSHIP}/actions/${ActionType.REGISTER}`,
    handler: onRegisterHandler,
    options: {
      tags: ['api', 'events'],
      description: 'Receives notifications on event actions'
    }
  })

  server.route({
    method: 'POST',
    path: `/trigger/events/${Event.Birth}/actions/${ActionType.REGISTER}`,
    handler: onRegisterHandler,
    options: {
      tags: ['api', 'events'],
      description: 'Receives notifications on event actions'
    }
  })

  server.route({
    method: 'POST',
    path: `/trigger/events/${Event.Death}/actions/${ActionType.REGISTER}`,
    handler: onRegisterHandler,
    options: {
      tags: ['api', 'events'],
      description: 'Receives notifications on event actions'
    }
  })

  server.route(getUserNotificationRoutes())

  server.route({
    method: 'GET',
    path: '/triggers/system/ready',
    handler: (_request, h) => {
      // Not implemented by default
      // You can use this endpoint to for instance set up integration clients
      return h.response().code(501)
    },
    options: {
      tags: ['api', 'triggers'],
      description: 'System ready endpoint'
    }
  })

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope?: any }, h) {
      request.sentryScope?.setExtra('payload', request.payload)
      return h.continue
    }
  })

  server.ext('onPostHandler', async (request, h) => {
    const response = request.response as Hapi.ResponseObject
    const parsedPath = /^\/trigger\/events\/[^/]+\/actions\/([^/]+)$/.exec(
      request.route.path
    )

    const actionType = parsedPath?.[1] as ActionType | null
    const wasRequestForActionConfirmation =
      actionType && request.method === 'post'
    const wasActionAcceptedImmediately = response.statusCode === 200

    if (wasRequestForActionConfirmation && wasActionAcceptedImmediately) {
      const event = request.payload as EventDocument

      const eventWithOptimisticallyApprovedLastAction = {
        ...event,
        actions: event.actions.map((action, index) =>
          index === event.actions.length - 1
            ? {
                ...action,
                status: ActionStatus.Accepted,
                ...(actionType === ActionType.REGISTER
                  ? {
                      registrationNumber: (
                        response.source as { registrationNumber: string }
                      ).registrationNumber
                    }
                  : {})
              }
            : action
        ) as ActionDocument[]
      }

      const client = getClient()
      try {
        await client.transaction().execute(async (trx) => {
          await importEvent(eventWithOptimisticallyApprovedLastAction, trx)
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        throw error
      }
    }
    return h.continue
  })

  let lastLocationSyncAt = 0
  const ONE_HOUR_MS = 60 * 60 * 1000

  async function syncLocations(req: Hapi.Request<Hapi.ReqRefDefaults>) {
    const now = Date.now()
    // Sync locations at most once per hour rather than every call
    if (now - lastLocationSyncAt > ONE_HOUR_MS) {
      const url = new URL('events', GATEWAY_URL).toString()
      const apiClient = createClient(url, req.headers.authorization)
      const locations = await apiClient.locations.list.query()
      const administrativeAreas =
        await apiClient.administrativeAreas.list.query()

      await importAdministrativeAreas(administrativeAreas)
      await importLocations(locations)
      lastLocationSyncAt = now
      logger.info('Reindex: locations synced into analytics.')
    }
  }

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    await syncLocationLevels()
    await syncLocationStatistics()

    logger.info(
      `Server successfully started on ${COUNTRY_CONFIG_HOST}:${COUNTRY_CONFIG_PORT}`
    )
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then((server) => server.start())
}
