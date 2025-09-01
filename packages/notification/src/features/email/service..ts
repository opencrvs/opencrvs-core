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
import {
  logger,
  TriggerEvent,
  triggerUserEventNotification
} from '@opencrvs/commons'
import { internal, tooManyRequests } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { getUserDetails } from '@notification/features/utils'
import { COUNTRY_CONFIG_URL } from '@notification/constants'

interface AllUsersEmailPayloadSchema {
  subject: string
  body: string
  bcc: string[]
  locale: string
  requestId: string
}

let isLoopInprogress = false

export async function sendAllUserEmails(request: Hapi.Request) {
  const userDetails = await getUserDetails(request)
  const recipientEmail = userDetails?.emailForNotification
  const payload = request.payload as AllUsersEmailPayloadSchema
  await preProcessRequest(request)
  await NotificationQueue.create({
    ...payload,
    ...(recipientEmail && { recipientEmail })
  })
  if (!isLoopInprogress) {
    loopNotificationQueue(request.server)
  }
  return {
    success: true
  }
}

async function countQueueRecordsOfCurrentDay(requestId: string) {
  const startOfTheDay = new Date()
  startOfTheDay.setHours(0, 0, 0, 0)
  const endOfTheDay = new Date()
  endOfTheDay.setHours(23, 59, 59, 999)
  return NotificationQueue.count({
    $and: [
      { createdAt: { $gte: startOfTheDay, $lt: endOfTheDay } },
      { requestId: { $ne: requestId } },
      {
        $or: [
          { error: { $exists: false } },
          { 'error.statusCode': { $gte: 500 } }
        ]
      }
    ]
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

  if (currentDayRecords > 10) {
    throw tooManyRequests('Already sent mails for today')
  }
}

async function findOldestNotificationQueueRecord() {
  return NotificationQueue.findOne({
    $and: [
      { status: { $ne: 'success' } },
      {
        $or: [
          { error: { $exists: false } },
          { 'error.statusCode': { $gte: 500 } }
        ]
      }
    ]
  }).sort({ createdAt: 1 })
}

async function dispatch(
  recipientEmail: string,
  record: NotificationQueueRecord
) {
  return await triggerUserEventNotification({
    event: TriggerEvent.ALL_USER_NOTIFICATION,
    payload: {
      subject: record.subject,
      body: record.body,
      recipient: {
        email: recipientEmail,
        bcc: record.bcc.filter((item) => item !== recipientEmail)
      }
    },
    countryConfigUrl: COUNTRY_CONFIG_URL,
    authHeader: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` }
  })
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
      status: 'success',
      $unset: {
        error: ''
      }
    }
  )
}

export async function loopNotificationQueue(server: Hapi.Server) {
  isLoopInprogress = true

  let record = await findOldestNotificationQueueRecord()

  while (record) {
    logger.info(
      `Notification service: Initiating dispatch of notification emails for ${record.bcc.length} users`
    )

    if (!record.recipientEmail) {
      throw new Error('Recipient email is required for all user notification')
    }
    const res = await dispatch(record.recipientEmail, record)

    if (!res.ok) {
      const error: any = await res.json()

      await markQueueRecordFailedWithErrorDetails(record, error)
      server.log(['error', error.error, internal(error.message)])
    } else {
      await markQueueRecordSuccess(record)
    }
    record = await findOldestNotificationQueueRecord()
  }
  isLoopInprogress = false
}
