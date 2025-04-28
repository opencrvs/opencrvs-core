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
import { createClient } from 'redis'
import { env } from '@auth/environment'
import { logger } from '@opencrvs/commons'

export const redisClient = createClient({
  url: env.REDIS_HOST,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD
})

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
  await redisClient.connect()
}
