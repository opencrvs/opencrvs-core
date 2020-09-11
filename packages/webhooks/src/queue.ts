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

import { REDIS_HOST, QUEUE_NAME } from '@webhooks/constants'
import { Queue, QueueEvents } from 'bullmq'
import { EventEmitter } from 'events'
import { logger } from '@webhooks/logger'

type QueueEventType = {
  jobId: string
  delay?: number
  data?: string
  returnvalue?: string
  prev?: string
  failedReason?: string
}

async function removeJob(myQueue: Queue, id: string) {
  const job = await myQueue.getJob(id)
  if (job) {
    job.remove()
  }
}

export function initQueue(): Queue {
  logger.info(`Initialising queue on REDIS_HOST: ${REDIS_HOST}`)
  const webhookQueue = new Queue(QUEUE_NAME, {
    connection: {
      host: REDIS_HOST,
      port: 6379
    }
  })

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
    removeJob(webhookQueue, jobId)
  })

  queueEvents.on('failed', ({ jobId, failedReason }: QueueEventType) => {
    logger.info(`${jobId} has failed with reason ${failedReason}`)
  })
  return webhookQueue
}
