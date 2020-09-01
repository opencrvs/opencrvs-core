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

import fetch from 'node-fetch'
import { logger } from '@webhooks/logger'
import { Job } from 'bull'

export interface IProcessData {
  url: string
  payload: any
}

export async function webhookProcessor(job: Job) {
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
}
