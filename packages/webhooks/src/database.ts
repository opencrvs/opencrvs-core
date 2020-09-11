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
import * as redis from 'redis'
import { MONGO_URL, REDIS_HOST } from '@webhooks/constants'
import { logger } from '@webhooks/logger'

let redisClient: redis.RedisClient
const db = mongoose.connection

db.on('disconnected', () => {
  logger.info('MongoDB disconnected')
})

db.on('connected', () => {
  logger.info('Connected to MongoDB')
})

// tslint:disable-next-line
const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

const connect = async (): Promise<void> => {
  logger.info('REDIS_HOST', REDIS_HOST)
  redisClient = redis.createClient({
    host: REDIS_HOST,
    retry_strategy: options => {
      return 1000
    }
  })
  try {
    await mongoose.connect(MONGO_URL, { autoReconnect: true })
  } catch (err) {
    logger.error(err)
    await wait(1000)
    return connect()
  }
}

export async function stop() {
  redisClient.quit()
  mongoose.disconnect()
}

export async function start() {
  return connect()
}
