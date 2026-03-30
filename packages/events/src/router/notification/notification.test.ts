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

import { TRPCError } from '@trpc/server'
import { SCOPES, UUID } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import {
  countTodayNotifications,
  getNextProcessableNotification
} from '@events/storage/postgres/events/notifications'
import { NOTIFICATION_RETRY_LIMIT } from '@events/workers/notificationWorker'

async function insertUser(
  eventsDb: ReturnType<typeof getClient>,
  officeId: UUID
): Promise<{ id: UUID }> {
  return eventsDb
    .insertInto('users')
    .values({ role: 'ADMIN', status: 'active', officeId })
    .returning('id')
    .executeTakeFirstOrThrow() as Promise<{ id: UUID }>
}

async function insertNotification(
  eventsDb: ReturnType<typeof getClient>,
  createdBy: UUID,
  overrides: { status?: string; retryCount?: number; createdAt?: string } = {}
) {
  return eventsDb
    .insertInto('notifications')
    .values({
      subject: 'Test Subject',
      body: 'Test Body',
      recipients: ['recipient@test.com'],
      createdBy,
      ...overrides
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

describe('notification.broadcast', () => {
  describe('authorization', () => {
    test('rejects with FORBIDDEN if caller lacks CONFIG_UPDATE_ALL scope', async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [])

      await expect(
        client.notification.broadcast({
          subject: 'Test',
          body: 'Test body',
          locale: 'en'
        })
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })
  })

  test('rejects with NOT_FOUND if the logged-in admin is not in the database', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [SCOPES.CONFIG_UPDATE_ALL])

    await expect(
      client.notification.broadcast({
        subject: 'Test',
        body: 'Test body',
        locale: 'en'
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
  })

  test('rejects with NOT_FOUND if no active users with email addresses exist', async () => {
    const { user, eventsDb, locations } = await setupTestCase()

    await eventsDb
      .insertInto('users')
      .values({
        legacyId: user.id,
        role: user.role,
        status: 'active',
        officeId: locations[0].id
      })
      .execute()

    const client = createTestClient(user, [SCOPES.CONFIG_UPDATE_ALL])

    await expect(
      client.notification.broadcast({
        subject: 'Test',
        body: 'Test body',
        locale: 'en'
      })
    ).rejects.toMatchObject(
      new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active users with email addresses found'
      })
    )
  })

  test('rejects with TOO_MANY_REQUESTS if a notification was already sent today', async () => {
    const { user, eventsDb, locations } = await setupTestCase()

    await eventsDb
      .insertInto('users')
      .values([
        {
          legacyId: user.id,
          role: user.role,
          status: 'active',
          officeId: locations[0].id
        },
        {
          role: 'REGISTRATION_AGENT',
          status: 'active',
          email: 'recipient@test.com',
          officeId: locations[0].id
        }
      ])
      .execute()

    const client = createTestClient(user, [SCOPES.CONFIG_UPDATE_ALL])

    await client.notification.broadcast({
      subject: 'First',
      body: 'First body',
      locale: 'en'
    })

    await expect(
      client.notification.broadcast({
        subject: 'Second',
        body: 'Second body',
        locale: 'en'
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'TOO_MANY_REQUESTS' }))
  })

  test('creates a PENDING notification row with correct data and returns { success: true }', async () => {
    const { user, eventsDb, locations } = await setupTestCase()

    await eventsDb
      .insertInto('users')
      .values([
        {
          legacyId: user.id,
          role: user.role,
          status: 'active',
          officeId: locations[0].id
        },
        {
          role: 'REGISTRATION_AGENT',
          status: 'active',
          email: 'user1@test.com',
          officeId: locations[0].id
        },
        {
          role: 'REGISTRATION_AGENT',
          status: 'active',
          email: 'user2@test.com',
          officeId: locations[0].id
        }
      ])
      .execute()

    const client = createTestClient(user, [SCOPES.CONFIG_UPDATE_ALL])

    const result = await client.notification.broadcast({
      subject: 'Hello',
      body: 'World',
      locale: 'fr'
    })

    expect(result).toEqual({ success: true })

    const notification = await eventsDb
      .selectFrom('notifications')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(notification.status).toBe('PENDING')
    expect(notification.subject).toBe('Hello')
    expect(notification.body).toBe('World')
    expect(notification.locale).toBe('fr')
    expect(notification.recipients).toEqual(
      expect.arrayContaining(['user1@test.com', 'user2@test.com'])
    )
  })
})

describe('getNextProcessableNotification', () => {
  test('returns PENDING notifications', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertNotification(eventsDb, userId, { status: 'PENDING' })

    const result = await getNextProcessableNotification()
    expect(result).not.toBeUndefined()
    expect(result?.status).toBe('PENDING')
  })

  test('returns FAILED notifications under the retry limit', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertNotification(eventsDb, userId, {
      status: 'FAILED',
      retryCount: NOTIFICATION_RETRY_LIMIT - 1
    })

    const result = await getNextProcessableNotification()
    expect(result).not.toBeUndefined()
    expect(result?.status).toBe('FAILED')
  })

  test('ignores FAILED notifications at or above the retry limit', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertNotification(eventsDb, userId, {
      status: 'FAILED',
      retryCount: NOTIFICATION_RETRY_LIMIT
    })

    const result = await getNextProcessableNotification()
    expect(result).toBeUndefined()
  })

  test('ignores SENT notifications', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertNotification(eventsDb, userId, { status: 'SENT' })

    const result = await getNextProcessableNotification()
    expect(result).toBeUndefined()
  })
})

describe('countTodayNotifications', () => {
  test('counts only non-FAILED rows created today', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)

    await insertNotification(eventsDb, userId, { status: 'SENT' })

    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    await insertNotification(eventsDb, userId, {
      status: 'SENT',
      createdAt: yesterday.toISOString()
    })

    const count = await countTodayNotifications()
    expect(count).toBe(1)
  })

  test('does not count FAILED rows', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertNotification(eventsDb, userId, { status: 'FAILED' })

    const count = await countTodayNotifications()
    expect(count).toBe(0)
  })
})
