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
import { Queue, QueueEvents, Worker, Job } from 'bullmq'
import { EventEmitter } from 'events'
import { logger } from '@webhooks/logger'
import { getRedis } from '@webhooks/database'
import { initWorker } from '@webhooks/processor'

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

export function getQueue(): Queue {
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
  const connection = getRedis()
  logger.info(
    `Initialising queue on REDIS_HOST: ${REDIS_HOST} with connection: ${connection}`
  )
  const newQueue = new Queue(QUEUE_NAME, {
    connection
  })

  EventEmitter.defaultMaxListeners = 50

  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection
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

  const myWorker: Worker = initWorker(QUEUE_NAME)

  myWorker.on('drained', (job: Job) => {
    logger.info(`Queue is drained, no more jobs left`)
  })

  myWorker.on('completed', (job: Job) => {
    logger.info(`job ${job.id} has completed`)
  })

  myWorker.on('failed', (job: Job) => {
    logger.info(`job ${job.id} has failed`)
  })
  return newQueue
}
