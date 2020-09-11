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
import * as mongoose from 'mongoose'
import { MONGO_URL, REDIS_HOST } from '@webhooks/constants'
import { logger } from '@webhooks/logger'
import * as IORedis from 'ioredis'

const db = mongoose.connection

db.on('disconnected', () => {
  logger.info('MongoDB disconnected')
})

db.on('connected', () => {
  logger.info('Connected to MongoDB')
})

// tslint:disable-next-line
const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

let redisConnection: IORedis.Redis

export function getRedis(): IORedis.Redis {
  return redisConnection
}

const connect = async (): Promise<void> => {
  try {
    redisConnection = new IORedis(REDIS_HOST)

    redisConnection.on('error', error => {
      logger.error('Redis connection error', error)
    })

    redisConnection.on('exit', () => {
      logger.error(
        'Exiting...listener count',
        redisConnection.listenerCount('error')
      )
    })
  } catch (err) {
    logger.error(`Cant create Redis instance: ${err}`)
  }
  try {
    await mongoose.connect(MONGO_URL, { autoReconnect: true })
  } catch (err) {
    logger.error(`Cant connect to Mongo: ${err}`)
    await wait(1000)
    return connect()
  }
}

export async function stop() {
  mongoose.disconnect()
}

export async function start() {
  return connect()
}
