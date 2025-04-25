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
import { REDIS_HOST } from '@gateway/constants'
import { REDIS_PASSWORD } from '@gateway/constants'
import { promisify } from 'util'
import { logger } from '@opencrvs/commons'

let redisClient: redis.RedisClient

export async function stop() {
  redisClient.quit()
}

export function start(host = REDIS_HOST, port?: number, password = REDIS_PASSWORD) {
  return new Promise<redis.RedisClient>((resolve) => {
    logger.info(`REDIS_HOST, ${JSON.stringify(host)}`)
    redisClient = redis.createClient({
      host: host,
      port,
      password: password,
      retry_strategy: () => {
        return 1000
      }
    })
    redisClient.on('connect', () => {
      resolve(redisClient)
    })
  })
}

export const get = (key: string) =>
  promisify(redisClient.get).bind(redisClient)(key)

export const set = (key: string, value: string) =>
  promisify(redisClient.set).bind(redisClient)(key, value)

export const del = (key: string) =>
  promisify(redisClient.del).bind(redisClient)(key)

export const incrementWithTTL = (key: string, ttl: number) => {
  const multi = redisClient.multi([
    ['incr', key],
    ['pexpire', key, ttl]
  ])
  return promisify(multi.exec).call(multi)
}

export const getClient = () => redisClient
