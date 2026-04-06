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
  countTodayAnnouncements,
  getNextProcessableAnnouncement
} from '@events/storage/postgres/events/announcements'
import {
  BCC_CHUNK_SIZE,
  ANNOUNCEMENT_RETRY_LIMIT,
  processNextAnnouncement
} from '@events/workers/announcementWorker'
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

async function insertAnnouncement(
  eventsDb: ReturnType<typeof getClient>,
  createdBy: UUID,
  overrides: { status?: string; retryCount?: number; createdAt?: string } = {}
) {
  return eventsDb
    .insertInto('announcements')
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

describe('announcement.broadcast', () => {
  describe('authorization', () => {
    test('rejects with FORBIDDEN if caller lacks CONFIG_UPDATE_ALL scope', async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [])

      await expect(
        client.announcement.broadcast({
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
      client.announcement.broadcast({
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
      client.announcement.broadcast({
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

  test('rejects with BAD_REQUEST if subject is empty', async () => {
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

    await expect(
      client.announcement.broadcast({ subject: '', body: 'Body', locale: 'en' })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('rejects with BAD_REQUEST if body is empty', async () => {
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

    await expect(
      client.announcement.broadcast({
        subject: 'Subject',
        body: '',
        locale: 'en'
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('rejects with TOO_MANY_REQUESTS if an announcement was already sent today', async () => {
    const { user, eventsDb, locations } = await setupTestCase()

    const adminResult = await eventsDb
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
      .returning('id')
      .executeTakeFirstOrThrow()

    await insertAnnouncement(eventsDb, adminResult.id as UUID, {
      status: 'PENDING'
    })

    const client = createTestClient(user, [SCOPES.CONFIG_UPDATE_ALL])

    await expect(
      client.announcement.broadcast({
        subject: 'Second',
        body: 'Second body',
        locale: 'en'
      })
    ).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' })
  })

  test('allows broadcast when only FAILED announcements exist today', async () => {
    const { user, eventsDb, locations } = await setupTestCase()

    const adminResult = await eventsDb
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
      .returning('id')
      .executeTakeFirstOrThrow()

    await insertAnnouncement(eventsDb, adminResult.id as UUID, {
      status: 'FAILED'
    })

    const client = createTestClient(user, [SCOPES.CONFIG_UPDATE_ALL])

    await expect(
      client.announcement.broadcast({
        subject: 'Retry',
        body: 'Retry body',
        locale: 'en'
      })
    ).resolves.toEqual({ success: true })
  })

  test('creates a PENDING announcement row with correct data and returns { success: true }', async () => {
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

    const result = await client.announcement.broadcast({
      subject: 'Hello',
      body: 'World',
      locale: 'fr'
    })

    expect(result).toEqual({ success: true })

    const announcement = await eventsDb
      .selectFrom('announcements')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(announcement.subject).toBe('Hello')
    expect(announcement.body).toBe('World')
    expect(announcement.locale).toBe('fr')
    expect(announcement.recipients).toEqual(
      expect.arrayContaining(['user1@test.com', 'user2@test.com'])
    )
  })
})

describe('getNextProcessableAnnouncement', () => {
  test('returns PENDING announcements', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertAnnouncement(eventsDb, userId, { status: 'PENDING' })

    const result = await getNextProcessableAnnouncement()
    expect(result).not.toBeUndefined()
    expect(result?.status).toBe('PENDING')
  })

  test('returns FAILED announcements under the retry limit', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertAnnouncement(eventsDb, userId, {
      status: 'FAILED',
      retryCount: ANNOUNCEMENT_RETRY_LIMIT - 1
    })

    const result = await getNextProcessableAnnouncement()
    expect(result).not.toBeUndefined()
    expect(result?.status).toBe('FAILED')
  })

  test('returns IN_PROGRESS announcements', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertAnnouncement(eventsDb, userId, { status: 'IN_PROGRESS' })

    const result = await getNextProcessableAnnouncement()
    expect(result).not.toBeUndefined()
    expect(result?.status).toBe('IN_PROGRESS')
  })

  test('ignores FAILED announcements at or above the retry limit', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertAnnouncement(eventsDb, userId, {
      status: 'FAILED',
      retryCount: ANNOUNCEMENT_RETRY_LIMIT
    })

    const result = await getNextProcessableAnnouncement()
    expect(result).toBeUndefined()
  })

  test('ignores SENT announcements', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertAnnouncement(eventsDb, userId, { status: 'SENT' })

    const result = await getNextProcessableAnnouncement()
    expect(result).toBeUndefined()
  })
})

describe('countTodayAnnouncements', () => {
  test('counts only non-FAILED rows created today', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)

    await insertAnnouncement(eventsDb, userId, { status: 'SENT' })

    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    await insertAnnouncement(eventsDb, userId, {
      status: 'SENT',
      createdAt: yesterday.toISOString()
    })

    const count = await countTodayAnnouncements()
    expect(count).toBe(1)
  })

  test('does not count FAILED rows', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertUser(eventsDb, locations[0].id)
    await insertAnnouncement(eventsDb, userId, { status: 'FAILED' })

    const count = await countTodayAnnouncements()
    expect(count).toBe(0)
  })
})

describe('processNextAnnouncement', () => {
  const ALL_USER_NOTIFICATION_URL = `${env.COUNTRY_CONFIG_URL}/triggers/user/all-user-notification`

  test('sends all recipients in a single call when under the chunk size', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertAdminWithEmail(eventsDb, locations[0].id)

    const recipients = generateEmails(3)
    await eventsDb
      .insertInto('announcements')
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

    await processNextAnnouncement()

    const announcement = await eventsDb
      .selectFrom('announcements')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(announcement.status).toBe('SENT')
    expect(capturedBcc).toEqual(expect.arrayContaining(recipients))
  })

  test('sends recipients in chunks of BCC_CHUNK_SIZE and updates progress after each', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertAdminWithEmail(eventsDb, locations[0].id)

    const recipients = generateEmails(BCC_CHUNK_SIZE + 1)
    await eventsDb
      .insertInto('announcements')
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

    await processNextAnnouncement()

    const afterFirstChunk = await eventsDb
      .selectFrom('announcements')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(afterFirstChunk.status).toBe('IN_PROGRESS')
    expect(afterFirstChunk.progress).toBe(BCC_CHUNK_SIZE)
    expect(dispatchedBccSizes).toEqual([BCC_CHUNK_SIZE])

    await processNextAnnouncement()

    const afterSecondChunk = await eventsDb
      .selectFrom('announcements')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(afterSecondChunk.status).toBe('SENT')
    expect(dispatchedBccSizes).toEqual([BCC_CHUNK_SIZE, 1])
  })

  test('marks announcement as FAILED and increments retryCount when dispatch fails', async () => {
    const { eventsDb, locations } = await setupTestCase()
    const { id: userId } = await insertAdminWithEmail(eventsDb, locations[0].id)

    await eventsDb
      .insertInto('announcements')
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

    await processNextAnnouncement()

    const announcement = await eventsDb
      .selectFrom('announcements')
      .selectAll()
      .executeTakeFirstOrThrow()

    expect(announcement.status).toBe('FAILED')
    expect(announcement.retryCount).toBe(1)
  })
})
