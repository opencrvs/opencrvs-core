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
import { REDIS_HOST, REDIS_PASSWORD, REDIS_USERNAME } from '@gateway/constants'
import { createClient } from 'redis'

export let redis: ReturnType<typeof createClient>

export async function stop() {
  redis.quit()
}

export async function start(host = REDIS_HOST, port?: number) {
  if (process.env.NODE_ENV === 'production' && !REDIS_PASSWORD) {
    throw new Error(
      'REDIS_PASSWORD is not set. Please make sure a password exists'
    )
  }

  redis = await createClient({
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    socket: {
      host,
      port
    }
  }).connect()
}
