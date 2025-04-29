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
import * as redis from 'redis'
import { env } from '@auth/environment'
import { promisify } from 'util'
import { getRedisUrl, logger } from '@opencrvs/commons'

let redisClient: redis.RedisClient

export interface IDatabaseConnector {
  stop: () => void
  start: () => void
  set: (key: string, value: string) => Promise<void>
  setex: (key: string, ttl: number, value: string) => Promise<void>
  get: (key: string) => Promise<string | null>
  del: (key: string) => Promise<number>
}

export async function stop() {
  redisClient.quit()
}

export async function start() {
  logger.info(`REDIS_HOST, ${JSON.stringify(env.REDIS_HOST)}`)
  logger.info(`REDIS_USERNAME, ${JSON.stringify(env.REDIS_USERNAME)}`)

  const url = getRedisUrl(
    env.REDIS_HOST,
    undefined,
    env.REDIS_USERNAME,
    env.REDIS_PASSWORD
  )

  logger.info(`REDIS_URL, ${JSON.stringify(url)}`)

  redisClient = redis.createClient({
    url,
    retry_strategy: () => 1000
  })
}

export const get = (key: string) =>
  promisify(redisClient.get).bind(redisClient)(key)

export const set = (key: string, value: string) =>
  promisify(redisClient.set).bind(redisClient)(key, value)

export const setex = (key: string, ttl: number, value: string) =>
  promisify(redisClient.setex).bind(redisClient)(key, ttl, value)

export const del = (key: string) =>
  promisify(redisClient.del).bind(redisClient)(key)
