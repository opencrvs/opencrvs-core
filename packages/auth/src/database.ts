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
import { env } from '@auth/environment'
import { logger } from '@opencrvs/commons'
import { createClient } from 'redis'

export let redis: ReturnType<typeof createClient>

export async function stop() {
  redis.quit()
}

export async function start() {
  logger.info(`REDIS_HOST, ${JSON.stringify(env.REDIS_HOST)}`)
  logger.info(`REDIS_USERNAME, ${JSON.stringify(env.REDIS_USERNAME)}`)

  redis = await createClient({
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    socket: {
      host: env.REDIS_HOST
    }
  })
    .on('error', (err) => logger.error('Redis Client Error', err))
    .connect()
}
