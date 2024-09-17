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
} from '@metrics/constants'
import getPlugins from '@metrics/config/plugins'
import { getRoutes } from '@metrics/config/routes'
import { readFileSync } from 'fs'
import { influx } from '@metrics/influxdb/client'
import {
  INFLUX_DB,
  INFLUX_HOST,
  INFLUX_PORT
} from '@metrics/influxdb/constants'
import * as database from '@metrics/config/database'
import { register } from './workers'
import { badRequest, Boom } from '@hapi/boom'
import { logger } from '@opencrvs/commons'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800, timeout: DEFAULT_TIMEOUT },
      response: {
        failAction: async (req, _2, err: Boom) => {
          if (process.env.NODE_ENV === 'production') {
            // In prod, log a limited error message and throw the default Bad Request error.
            logger.error(`Response validationError: ${err.message}`)
            throw badRequest(`Invalid response payload returned from handler`)
          } else {
            // During development, log and respond with the full error.
            logger.error(
              `${req.path} response has a validation error: ${err.message}`
            )
            throw err
          }
        }
      }
    }
  })

  await server.register(getPlugins())

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
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
    return influx
      .getDatabaseNames()
      .then((names: any) => {
        if (!names.includes(INFLUX_DB)) {
          return influx.createDatabase(INFLUX_DB)
        }
      })
      .then(async () => {
        server.log('info', `InfluxDB started on ${INFLUX_HOST}:${INFLUX_PORT}`)
        await server.start()
        await register()
        await database.start()
        server.log('info', `Metrics server started on ${HOST}:${PORT}`)
      })
      .catch((err: Error) => {
        server.log('info', `Error creating Influx database! ${err.stack}`)
        throw err
      })
  }

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'Metrics server stopped')
  }

  return { server, start, stop }
}
