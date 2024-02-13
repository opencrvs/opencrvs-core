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

import fetch from 'node-fetch'
import { logger } from '@webhooks/logger'
import { Worker } from 'bullmq'
import * as IORedis from 'ioredis'

export interface IProcessData {
  url: string
  payload: any
}

export function initWorker(name: string, connection: IORedis.Redis): Worker {
  return new Worker(
    name,
    async (job) => {
      try {
        await fetch(job.data.url, {
          method: 'POST',
          body: JSON.stringify(job.data.payload),
          headers: {
            'Content-Type': 'application/json',
            'X-Hub-Signature': job.data.hmac
          }
        })
      } catch (err) {
        logger.error(err)
        throw err
      }
    },
    { connection }
  )
}
