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
import { http, HttpResponse } from 'msw'
import { SCOPES, UUID } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import {
  countTodayNotifications,
  getNextProcessableNotification
} from '@events/storage/postgres/events/notifications'
import {
  BCC_CHUNK_SIZE,
  NOTIFICATION_RETRY_LIMIT,
  processNextNotification
} from '@events/workers/notificationWorker'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'

function generateEmails(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `user${i}@test.com`)
}

async function insertUser(
  eventsDb: ReturnType<typeof getClient>,
  officeId: UUID
): Promise<{ id: UUID }> {
  return eventsDb
    .insertInto('users')
    .values({
      role: 'ADMIN',
      status: 'active',
      mobile: '+1234567890',
      officeId
    })
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

async function insertAdminWithEmail(
  eventsDb: ReturnType<typeof getClient>,
  officeId: UUID
): Promise<{ id: UUID; email: string }> {
  const email = 'admin@test.com'
  const result = await eventsDb
    .insertInto('users')
    .values({ role: 'ADMIN', status: 'active', email, officeId })
    .returning('id')
    .executeTakeFirstOrThrow()
  return { id: result.id as UUID, email }
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
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  test('rejects with NOT_FOUND if no active users with email addresses exist', async () => {
    const { user, eventsDb, locations } = await setupTestCase()

    await eventsDb
      .insertInto('users')
      .values({
        legacyId: user.id,
        role: user.role,
        status: 'active',
        mobile: '+1234567890',
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
          mobile: '+1234567890',
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
    ).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' })
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
          mobile: '+1234567890',
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

describe('processNextNotification', () => {
  const ALL_USER_NOTIFICATION_URL = `${env.COUNTRY_CONFIG_URL}/triggers/user/all-user-notification`

  test('sends all recipients in a single call when under the chunk size', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertAdminWithEmail(eventsDb, locations[0].id)

    const recipients = generateEmails(3)
    await eventsDb
      .insertInto('notifications')
      .values({ subject: 'Hi', body: 'Body', recipients, createdBy: userId })
      .execute()

    const capturedBcc: string[] = []
    mswServer.use(
      http.post(ALL_USER_NOTIFICATION_URL, async ({ request }) => {
        const body = (await request.json()) as { recipient: { bcc: string[] } }
        capturedBcc.push(...body.recipient.bcc)
        return HttpResponse.json({ ok: true })
      })
    )

    await processNextNotification()

    const notification = await eventsDb
      .selectFrom('notifications')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(notification.status).toBe('SENT')
    expect(capturedBcc).toEqual(expect.arrayContaining(recipients))
  })

  test('sends recipients in chunks of BCC_CHUNK_SIZE and updates progress after each', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertAdminWithEmail(eventsDb, locations[0].id)

    const recipients = generateEmails(BCC_CHUNK_SIZE + 1)
    await eventsDb
      .insertInto('notifications')
      .values({ subject: 'Hi', body: 'Body', recipients, createdBy: userId })
      .execute()

    const dispatchedBccSizes: number[] = []
    mswServer.use(
      http.post(ALL_USER_NOTIFICATION_URL, async ({ request }) => {
        const body = (await request.json()) as { recipient: { bcc: string[] } }
        dispatchedBccSizes.push(body.recipient.bcc.length)
        return HttpResponse.json({ ok: true })
      })
    )

    await processNextNotification()

    const afterFirstChunk = await eventsDb
      .selectFrom('notifications')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(afterFirstChunk.status).toBe('PENDING')
    expect(afterFirstChunk.progress).toBe(BCC_CHUNK_SIZE)
    expect(dispatchedBccSizes).toEqual([BCC_CHUNK_SIZE])

    await processNextNotification()

    const afterSecondChunk = await eventsDb
      .selectFrom('notifications')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(afterSecondChunk.status).toBe('SENT')
    expect(dispatchedBccSizes).toEqual([BCC_CHUNK_SIZE, 1])
  })

  test('marks notification as FAILED and increments retryCount when dispatch fails', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertAdminWithEmail(eventsDb, locations[0].id)

    await eventsDb
      .insertInto('notifications')
      .values({
        subject: 'Hi',
        body: 'Body',
        recipients: generateEmails(1),
        createdBy: userId
      })
      .execute()

    mswServer.use(
      http.post(ALL_USER_NOTIFICATION_URL, () => HttpResponse.error())
    )

    await processNextNotification()

    const notification = await eventsDb
      .selectFrom('notifications')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(notification.status).toBe('FAILED')
    expect(notification.retryCount).toBe(1)
  })
})
