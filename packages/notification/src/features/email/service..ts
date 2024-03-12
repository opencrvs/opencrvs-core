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
import NotificationQueue from '@notification/model/notificationQueue'
import { AllUsersEmailPayloadSchema } from '@notification/features/email/all-user-handler'

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
  await loopThroughQueue()
  return {
    success: true
  }
}

async function loopThroughQueue() {
  let record = await NotificationQueue.findOne({
    status: { $ne: 'failed' }
  }).sort({ createdAt: -1 })

  while (record) {
    try {
      await notifyCountryConfig({
        subject: record.subject,
        body: record.body,
        bcc: record.bcc
      })
    } catch (e) {
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
    record = await NotificationQueue.findOne({
      status: { $ne: 'failed' }
    }).sort({ createdAt: -1 })
  }
}
