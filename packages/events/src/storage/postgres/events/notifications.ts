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
import { NOTIFICATION_RETRY_LIMIT } from '@events/workers/notificationWorker'

function startOfToday(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}
import { NewNotifications } from './schema/app/Notifications'

export async function createNotification(
  params: Omit<
    NewNotifications,
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
    .insertInto('notifications')
    .values(params)
    .returning('id')
    .executeTakeFirstOrThrow()
}

export async function getNextProcessableNotification() {
  const db = getClient()
  return db
    .selectFrom('notifications')
    .selectAll()
    .where((eb) =>
      eb.or([
        eb('status', '=', 'PENDING'),
        eb.and([eb('status', '=', 'FAILED'), eb('retryCount', '<', NOTIFICATION_RETRY_LIMIT)])
      ])
    )
    .orderBy('createdAt', 'asc')
    .limit(1)
    .executeTakeFirst()
}

export async function updateNotificationProgress(id: UUID, progress: number) {
  const db = getClient()
  return db
    .updateTable('notifications')
    .set({ progress })
    .where('id', '=', id)
    .execute()
}

export async function markNotificationSent(id: UUID) {
  const db = getClient()
  return db
    .updateTable('notifications')
    .set({ status: 'SENT', sentAt: new Date().toISOString() })
    .where('id', '=', id)
    .execute()
}

export async function markNotificationFailed(
  id: UUID,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: Record<string, any>
) {
  const db = getClient()
  return db
    .updateTable('notifications')
    .set((eb) => ({
      status: 'FAILED',
      retryCount: eb('retryCount', '+', 1),
      error
    }))
    .where('id', '=', id)
    .execute()
}

export async function countTodayNotifications() {
  const db = getClient()
  const result = await db
    .selectFrom('notifications')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .where('status', '!=', 'FAILED')
    .where('createdAt', '>=', startOfToday())
    .executeTakeFirstOrThrow()
  return Number(result.count)
}
