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

import NotificationQueue, {
  NotificationQueueRecord
} from '@notification/model/notificationQueue'
import { AllUsersEmailPayloadSchema } from '@notification/features/email/all-user-handler'
import { logger } from '@notification/logger'
import { notifyCountryConfig } from '@notification/features/sms/service'

let isLoopInprogress = false

export async function sendAllUserEmails(
  payload: AllUsersEmailPayloadSchema,
  token: string
) {
  await NotificationQueue.create(payload)
  if (!isLoopInprogress) {
    loopNotificationQueue(token)
  }
  return {
    success: true
  }
}

async function findOldestNotificationQueueRecord() {
  return await NotificationQueue.findOne({
    status: { $ne: 'failed' }
  }).sort({ createdAt: -1 })
}

async function dispatch(record: NotificationQueueRecord, token: string) {
  await notifyCountryConfig(
    {
      email: 'allUserNotification'
    },
    { email: record.bcc[0], bcc: record.bcc.slice(1) },
    'user',
    {
      subject: record.subject,
      body: record.body
    },
    token,
    record.locale
  )
  await NotificationQueue.deleteOne({ _id: record._id })
}

async function markQueueRecordFailedWithErrorDetails(
  record: NotificationQueueRecord,
  e: Error & { statusCode: number; error: string }
) {
  await NotificationQueue.updateOne(
    { _id: record._id },
    {
      status: 'failed',
      error: {
        statusCode: e.statusCode,
        message: e.message,
        error: e.error
      }
    }
  )
}

export async function loopNotificationQueue(token: string) {
  isLoopInprogress = true
  let record = await findOldestNotificationQueueRecord()
  while (record) {
    try {
      logger.info(
        `Notification service: Initiating dispatch of notification emails for ${record.bcc.length} users`
      )
      await dispatch(record, token)
    } catch (e) {
      await markQueueRecordFailedWithErrorDetails(record, e)
    }
    record = await findOldestNotificationQueueRecord()
  }
  isLoopInprogress = false
}
