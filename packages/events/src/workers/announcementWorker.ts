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
  getNextProcessableAnnouncement,
  markAnnouncementFailed,
  markAnnouncementSent,
  updateAnnouncementProgress
} from '@events/storage/postgres/events/announcements'

const POLL_INTERVAL_MS = 30_000
export const BCC_CHUNK_SIZE = 500
export const DAILY_ANNOUNCEMENT_LIMIT = 1
export const ANNOUNCEMENT_RETRY_LIMIT = 3

export async function processNextAnnouncement() {
  const announcement = await getNextProcessableAnnouncement()
  if (!announcement) {
    return
  }

  // PostgreSQL arrays preserve insertion order (elements are stored and accessed
  // positionally), so slicing by progress offset is safe across retries — the
  // same index always refers to the same recipient.
  // https://www.postgresql.org/docs/9.3/arrays.html#AEN6942
  const chunk = announcement.recipients.slice(
    announcement.progress,
    announcement.progress + BCC_CHUNK_SIZE
  )

  if (chunk.length === 0) {
    await markAnnouncementSent(announcement.id)
    return
  }

  const admin = await getClient()
    .selectFrom('users')
    .select('email')
    .where('id', '=', announcement.createdBy)
    .executeTakeFirst()

  if (!admin?.email) {
    logger.error(
      `Announcement worker: admin user ${announcement.createdBy} has no email — cannot dispatch announcement ${announcement.id}`
    )
    await markAnnouncementFailed(announcement.id, {
      message: 'Admin user has no email address'
    })
    return
  }

  logger.info(
    `Announcement worker: dispatching chunk of ${chunk.length} recipients for announcement ${announcement.id} (progress ${announcement.progress})`
  )

  try {
    const res = await triggerUserEventNotification({
      event: TriggerEvent.ALL_USER_NOTIFICATION,
      payload: {
        subject: announcement.subject,
        body: announcement.body,
        recipient: {
          email: admin.email,
          // admin is the TO: recipient — exclude from BCC to avoid sending a duplicate
          bcc: chunk.filter((e) => e !== admin.email)
        }
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL
    })

    if (res.ok) {
      const newProgress = announcement.progress + chunk.length
      if (newProgress >= announcement.recipients.length) {
        await markAnnouncementSent(announcement.id)
        logger.info(
          `Announcement worker: announcement ${announcement.id} fully sent`
        )
      } else {
        await updateAnnouncementProgress(announcement.id, newProgress)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = (await res.json()) as Record<string, any>
      logger.error(
        `Announcement worker: dispatch failed for announcement ${announcement.id}: ${JSON.stringify(error)}`
      )
      await markAnnouncementFailed(announcement.id, error)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error(
      `Announcement worker: unexpected error for announcement ${announcement.id}: ${message}`
    )
    await markAnnouncementFailed(announcement.id, { message })
  }
}

export function startAnnouncementWorker() {
  setInterval(() => void processNextAnnouncement(), POLL_INTERVAL_MS)
}
