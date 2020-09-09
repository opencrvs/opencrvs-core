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
import { Queue } from 'bullmq'

export const webhookQueue = new Queue(QUEUE_NAME, {
  connection: {
    host: REDIS_HOST,
    port: 6379
  }
})

export type QueueEventType = {
  jobId: string
  delay?: number
  data?: string
  returnvalue?: string
  prev?: string
  failedReason?: string
}
