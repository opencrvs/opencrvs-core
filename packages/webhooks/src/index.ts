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
// tslint:disable-next-line no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import * as Hapi from 'hapi'
import {
  HOST,
  PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  QUEUE_NAME
} from '@webhooks/constants'
import getPlugins from '@webhooks/config/plugins'
import * as database from '@webhooks/database'
import { readFileSync } from 'fs'
import { validateFunc } from '@opencrvs/commons'
import { getRoutes } from '@webhooks/config/routes'
import { EventEmitter } from 'events'
import { QueueEvents } from 'bullmq'
import { QueueEventType } from '@webhooks/queue'
import { logger } from '@webhooks/logger'

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
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:webhooks-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  const routes = getRoutes()
  server.route(routes)

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope: any }, h) {
      request.sentryScope.setExtra('payload', request.payload)
      return h.continue
    }
  })

  async function start() {
    await server.start()
    await database.start()
    server.log('info', `server started on ${HOST}:${PORT}`)

    EventEmitter.defaultMaxListeners = 50

    const queueEvents = new QueueEvents(QUEUE_NAME)

    queueEvents.on('waiting', ({ jobId }: QueueEventType) => {
      logger.info(`A job with ID ${jobId} is waiting`)
    })

    queueEvents.on('active', ({ jobId, prev }: QueueEventType) => {
      logger.info(`Job ${jobId} is now active; previous status was ${prev}`)
    })

    queueEvents.on('completed', ({ jobId, returnvalue }: QueueEventType) => {
      logger.info(`${jobId} has completed and returned ${returnvalue}`)
    })

    queueEvents.on('failed', ({ jobId, failedReason }: QueueEventType) => {
      logger.info(`${jobId} has failed with reason ${failedReason}`)
    })
  }

  async function stop() {
    await server.stop()
    await database.stop()
    server.log('info', 'server stopped')
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
