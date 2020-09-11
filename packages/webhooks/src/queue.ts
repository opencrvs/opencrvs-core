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
import * as IORedis from 'ioredis'

type QueueEventType = {
  jobId: string
  delay?: number
  data?: string
  returnvalue?: string
  prev?: string
  failedReason?: string
}

let webhookQueue: Queue

export interface IQueueConnector {
  getQueue: () => Promise<Queue | null>
}

export const getQueue = () => {
  return webhookQueue
}

export async function startQueue() {
  try {
    webhookQueue = initQueue()
  } catch (error) {
    logger.error(`Can't init webhook queue: ${error}`)
    throw Error(error)
  }
}

async function removeJob(myQueue: Queue, id: string) {
  const job = await myQueue.getJob(id)
  if (job) {
    job.remove()
  }
}

export function initQueue(): Queue {
  logger.info(`Initialising queue on REDIS_HOST: ${REDIS_HOST}`)
  const newQueue = new Queue(QUEUE_NAME, {
    connection: new IORedis(REDIS_HOST)
  })

  EventEmitter.defaultMaxListeners = 50

  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: new IORedis(REDIS_HOST)
  })

  queueEvents.on('waiting', ({ jobId }: QueueEventType) => {
    logger.info(`A job with ID ${jobId} is waiting`)
  })

  queueEvents.on('active', ({ jobId, prev }: QueueEventType) => {
    logger.info(`Job ${jobId} is now active; previous status was ${prev}`)
  })

  queueEvents.on('completed', ({ jobId, returnvalue }: QueueEventType) => {
    logger.info(`${jobId} has completed and returned ${returnvalue}`)
    removeJob(newQueue, jobId)
  })

  queueEvents.on('failed', ({ jobId, failedReason }: QueueEventType) => {
    logger.info(`${jobId} has failed with reason ${failedReason}`)
  })
  return newQueue
}
