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

import {
  logger,
  TriggerEvent,
  triggerUserEventNotification
} from '@opencrvs/commons'
import { env } from '@events/environment'
import { getClient } from '@events/storage/postgres/events'
import {
  getNextProcessableNotification,
  markNotificationFailed,
  markNotificationSent,
  updateNotificationProgress
} from '@events/storage/postgres/events/notifications'

export const BCC_CHUNK_SIZE = 500
export const POLL_INTERVAL_MS = 30_000
export const DAILY_NOTIFICATION_LIMIT = 1
export const NOTIFICATION_RETRY_LIMIT = 3

async function processNextNotification() {
  const notification = await getNextProcessableNotification()
  if (!notification) {
    return
  }

  // PostgreSQL arrays preserve insertion order (elements are stored and accessed
  // positionally), so slicing by progress offset is safe across retries — the
  // same index always refers to the same recipient.
  // https://www.postgresql.org/docs/9.3/arrays.html#AEN6942
  const chunk = notification.recipients.slice(
    notification.progress,
    notification.progress + BCC_CHUNK_SIZE
  )

  if (chunk.length === 0) {
    await markNotificationSent(notification.id)
    return
  }

  const admin = await getClient()
    .selectFrom('users')
    .select('email')
    .where('id', '=', notification.createdBy)
    .executeTakeFirst()

  if (!admin?.email) {
    logger.error(
      `Notification worker: admin user ${notification.createdBy} has no email — cannot dispatch notification ${notification.id}`
    )
    await markNotificationFailed(notification.id, {
      message: 'Admin user has no email address'
    })
    return
  }

  logger.info(
    `Notification worker: dispatching chunk of ${chunk.length} recipients for notification ${notification.id} (progress ${notification.progress})`
  )

  try {
    const res = await triggerUserEventNotification({
      event: TriggerEvent.ALL_USER_NOTIFICATION,
      payload: {
        subject: notification.subject,
        body: notification.body,
        recipient: {
          email: admin.email,
          bcc: chunk.filter((e) => e !== admin.email)
        }
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL,
      authHeader: { Authorization: `Bearer ${process.env.AUTH_TOKEN ?? ''}` }
    })

    if (res.ok) {
      const newProgress = notification.progress + chunk.length
      if (newProgress >= notification.recipients.length) {
        await markNotificationSent(notification.id)
        logger.info(
          `Notification worker: notification ${notification.id} fully sent`
        )
      } else {
        await updateNotificationProgress(notification.id, newProgress)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = (await res.json()) as Record<string, any>
      logger.error(
        `Notification worker: dispatch failed for notification ${notification.id}: ${JSON.stringify(error)}`
      )
      await markNotificationFailed(notification.id, error)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(
      `Notification worker: unexpected error for notification ${notification.id}: ${message}`
    )
    await markNotificationFailed(notification.id, { message })
  }
}

export function startNotificationWorker() {
  setInterval(() => void processNextNotification(), POLL_INTERVAL_MS)
}
