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
import { logger } from '@notification/logger'
import { notifyCountryConfig } from '@notification/features/sms/service'
import { internal, tooManyRequests } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'

interface AllUsersEmailPayloadSchema {
  subject: string
  body: string
  bcc: string[]
  locale: string
  requestId: string
}

let isLoopInprogress = false

export async function sendAllUserEmails(request: Hapi.Request) {
  const payload = request.payload as AllUsersEmailPayloadSchema
  await preProcessRequest(request)
  await NotificationQueue.create(payload)
  if (!isLoopInprogress) {
    loopNotificationQueue(request)
  }
  return {
    success: true
  }
}

async function countQueueRecordsOfCurrentDay(requestId: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return NotificationQueue.count({
    createdAt: { $gte: start, $lt: end },
    requestId: { $ne: requestId }
  })
}

async function deleteAllStaleRecords() {
  const referenceDate = new Date()
  referenceDate.setHours(0, 0, 0, 0)
  return NotificationQueue.deleteMany({ createdAt: { $lt: referenceDate } })
}

async function preProcessRequest(request: Hapi.Request) {
  const payload = request.payload as AllUsersEmailPayloadSchema
  await deleteAllStaleRecords()
  const currentDayRecords = await countQueueRecordsOfCurrentDay(
    payload.requestId
  )

  if (currentDayRecords > 0) {
    throw tooManyRequests('Already sent mails for today')
  }
}

async function findOldestNotificationQueueRecord(requestId: string) {
  return NotificationQueue.findOne({
    status: { $exists: false },
    requestId
  }).sort({ createdAt: -1 })
}

async function dispatch(record: NotificationQueueRecord, token: string) {
  return notifyCountryConfig(
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
}

async function markQueueRecordFailedWithErrorDetails(
  record: NotificationQueueRecord,
  e: Error & { statusCode: number; error: string }
) {
  return NotificationQueue.updateOne(
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

async function markQueueRecordSuccess(record: NotificationQueueRecord) {
  return NotificationQueue.updateOne(
    { _id: record._id },
    {
      status: 'success'
    }
  )
}

export async function loopNotificationQueue(request: Hapi.Request) {
  const token = request.headers.authorization
  const payload = request.payload as AllUsersEmailPayloadSchema
  isLoopInprogress = true
  let record = await findOldestNotificationQueueRecord(payload.requestId)
  while (record) {
    logger.info(
      `Notification service: Initiating dispatch of notification emails for ${record.bcc.length} users`
    )
    const res = await dispatch(record, token)
    if (!res.ok) {
      const error = await res.json()
      await markQueueRecordFailedWithErrorDetails(record, error)
      request?.log(['error', error.error, internal(error.message)])
    } else {
      await markQueueRecordSuccess(record)
    }
    record = await findOldestNotificationQueueRecord(payload.requestId)
  }
  isLoopInprogress = false
}
