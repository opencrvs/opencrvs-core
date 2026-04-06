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

import { UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { ANNOUNCEMENT_RETRY_LIMIT } from '@events/workers/announcementWorker'
import { NewAnnouncements } from './schema/app/Announcements'

function startOfToday(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function createAnnouncement(
  params: Omit<
    NewAnnouncements,
    | 'id'
    | 'createdAt'
    | 'status'
    | 'progress'
    | 'retryCount'
    | 'error'
    | 'sentAt'
  >
) {
  const db = getClient()
  return db
    .insertInto('announcements')
    .values(params)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function getNextProcessableAnnouncement() {
  const db = getClient()
  return db
    .selectFrom('announcements')
    .selectAll()
    .where((eb) =>
      eb.or([
        eb('status', '=', 'PENDING'),
        eb('status', '=', 'IN_PROGRESS'),
        eb.and([
          eb('status', '=', 'FAILED'),
          eb('retryCount', '<', ANNOUNCEMENT_RETRY_LIMIT)
        ])
      ])
    )
    .orderBy('createdAt', 'asc')
    .limit(1)
    .executeTakeFirst()
}

export async function markAnnouncementInProgress(id: UUID) {
  const db = getClient()
  return db
    .updateTable('announcements')
    .set({ status: 'IN_PROGRESS' })
    .where('id', '=', id)
    .execute()
}

export async function updateAnnouncementProgress(id: UUID, progress: number) {
  const db = getClient()
  return db
    .updateTable('announcements')
    .set({ progress })
    .where('id', '=', id)
    .execute()
}

export async function markAnnouncementSent(id: UUID) {
  const db = getClient()
  return db
    .updateTable('announcements')
    .set({ status: 'SENT', sentAt: new Date().toISOString() })
    .where('id', '=', id)
    .execute()
}

export async function markAnnouncementFailed(
  id: UUID,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: Record<string, any>
) {
  const db = getClient()
  return db
    .updateTable('announcements')
    .set((eb) => ({
      status: 'FAILED',
      retryCount: eb('retryCount', '+', 1),
      error
    }))
    .where('id', '=', id)
    .execute()
}

/**
 * Counts non-FAILED announcements created since midnight UTC today.
 *
 * FAILED rows are excluded so that if a broadcast fails the admin can retry
 * the same day. PENDING and SENT rows count toward the daily limit to
 * prevent duplicate sends.
 */
export async function countTodayAnnouncements() {
  const db = getClient()
  const result = await db
    .selectFrom('announcements')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('status', '!=', 'FAILED')
    .where('createdAt', '>=', startOfToday())
    .executeTakeFirstOrThrow()
  return Number(result.count)
}

/** Returns the emails of all active users that have an email address. */
export async function collectActiveRecipientEmails(): Promise<string[]> {
  const db = getClient()
  const users = await db
    .selectFrom('users')
    .select('email')
    .where('status', '=', 'active')
    .where('email', 'is not', null)
    .execute()

  return users.map((u) => u.email).filter((e): e is string => e !== null)
}
