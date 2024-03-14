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
import { COUNTRY_CONFIG_URL } from '@notification/constants'
import NotificationQueue, {
  NotificationQueueRecord
} from '@notification/model/notificationQueue'
import { AllUsersEmailPayloadSchema } from '@notification/features/email/all-user-handler'
import { logger } from '@notification/logger'

let isLoopInprogress = false

async function notifyCountryConfig(payload: AllUsersEmailPayloadSchema) {
  const res = await fetch(`${COUNTRY_CONFIG_URL}/allUsersEmail`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-type': 'application/json'
    }
  })
  if (res.status === 200) {
    return await res.json()
  } else {
    throw await res.json()
  }
}

export async function sendAllUserEmails(payload: AllUsersEmailPayloadSchema) {
  await NotificationQueue.create(payload)
  if (!isLoopInprogress) {
    loopNotificationQueue()
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

async function dispatch(record: NotificationQueueRecord) {
  await notifyCountryConfig({
    subject: record.subject,
    body: record.body,
    bcc: record.bcc
  })
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

export async function loopNotificationQueue() {
  isLoopInprogress = true
  let record = await findOldestNotificationQueueRecord()
  while (record) {
    try {
      logger.info(
        `Notification service: Initiating dispatch of notification emails for ${record.bcc.length} users`
      )
      await dispatch(record)
    } catch (e) {
      await markQueueRecordFailedWithErrorDetails(record, e)
    }
    record = await findOldestNotificationQueueRecord()
  }
  isLoopInprogress = false
}
