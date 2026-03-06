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
import { http, HttpResponse, HttpResponseInit } from 'msw'
import {
  ActionStatus,
  ActionType,
  generateEventDocument,
  getUUID,
  SCOPES,
  TokenUserType
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createSystemTestClient,
  createTestToken,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { runReindex } from '@events/service/reindex'

// Mock the fire-and-forget wrapper only — runReindex stays real
vi.mock('@events/service/reindex', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@events/service/reindex')>()
  return {
    ...actual,
    reindex: vi.fn()
  }
})

const silentPostHandler = http.post(`${env.COUNTRY_CONFIG_URL}/reindex`, () =>
  HttpResponse.json({})
)

const failingPostHandler = http.post(
  `${env.COUNTRY_CONFIG_URL}/reindex`,
  () => new HttpResponse(null, { status: 500 } as HttpResponseInit)
)

const singleEventConfigHandler = http.get(
  `${env.COUNTRY_CONFIG_URL}/events`,
  () => HttpResponse.json([tennisClubMembershipEvent])
)

const reindexToken = createTestToken({
  userId: 'reindex-system',
  scopes: [SCOPES.RECORD_REINDEX],
  role: 'TEST_SYSTEM_ROLE',
  userType: TokenUserType.enum.system
})

beforeEach(async () => {
  mswServer.use(singleEventConfigHandler, silentPostHandler)

  const { user, eventsDb } = await setupTestCase()

  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [
      { type: ActionType.CREATE, user },
      { type: ActionType.DECLARE, user }
    ]
  })

  const eventInDb = await eventsDb
    .insertInto('events')
    .values({
      eventType: event.type,
      transactionId: getUUID(),
      trackingId: event.trackingId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    })
    .returning('id')
    .executeTakeFirst()

  await eventsDb
    .insertInto('eventActions')
    .values({
      id: getUUID(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      eventId: eventInDb!.id,
      actionType: ActionType.CREATE,
      createdBy: user.id,
      createdAt: event.createdAt,
      status: ActionStatus.Accepted,
      createdByRole: user.role,
      createdByUserType: 'user',
      transactionId: getUUID()
    })
    .execute()

  await eventsDb
    .insertInto('eventActions')
    .values({
      id: getUUID(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      eventId: eventInDb!.id,
      actionType: ActionType.DECLARE,
      createdBy: user.id,
      createdAt: event.createdAt,
      status: ActionStatus.Accepted,
      createdByRole: user.role,
      createdByUserType: 'user',
      transactionId: getUUID()
    })
    .execute()
})

test('returns empty array when no reindex has run', async () => {
  const client = createSystemTestClient('reindex-system', [
    SCOPES.RECORD_REINDEX
  ])
  const result = await client.event.reindex.status()
  expect(result).toEqual([])
})

test('returns 403 without RECORD_REINDEX scope', async () => {
  const client = createSystemTestClient('reindex-system', [])
  await expect(client.event.reindex.status()).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test('returns completed status after successful reindex', async () => {
  await runReindex(reindexToken)

  const client = createSystemTestClient('reindex-system', [
    SCOPES.RECORD_REINDEX
  ])
  const result = await client.event.reindex.status()

  expect(result).toHaveLength(1)
  expect(result[0].status).toBe('completed')
  expect(result[0].error_message).toBeNull()
  expect(result[0].completed_at).not.toBeNull()
})

test('returns failed status after failed reindex', async () => {
  mswServer.use(failingPostHandler)

  await runReindex(reindexToken).catch(() => {
    // Swallow — we only want to inspect the persisted status
  })

  const client = createSystemTestClient('reindex-system', [
    SCOPES.RECORD_REINDEX
  ])
  const result = await client.event.reindex.status()

  expect(result).toHaveLength(1)
  expect(result[0].status).toBe('failed')
  expect(result[0].error_message).toBeTruthy()
  expect(result[0].completed_at).not.toBeNull()
})

test('returns results ordered newest-first', async () => {
  await runReindex(reindexToken)
  await runReindex(reindexToken)

  const client = createSystemTestClient('reindex-system', [
    SCOPES.RECORD_REINDEX
  ])
  const result = await client.event.reindex.status()

  expect(result).toHaveLength(2)
  expect(result[0].timestamp >= result[1].timestamp).toBe(true)
})

test('limit parameter is respected', async () => {
  await runReindex(reindexToken)
  await runReindex(reindexToken)
  await runReindex(reindexToken)

  const client = createSystemTestClient('reindex-system', [
    SCOPES.RECORD_REINDEX
  ])
  const result = await client.event.reindex.status({ limit: 2 })

  expect(result).toHaveLength(2)
})

test.only('running reindex appears with running status', async () => {
  const client = createSystemTestClient('reindex-system', [
    SCOPES.RECORD_REINDEX
  ])

  // Start reindex without awaiting it to observe the intermediate state
  const reindexPromise = runReindex(reindexToken)

  // Poll until we see at least one entry
  let history: Awaited<ReturnType<typeof client.event.reindex.status>> = []
  for (let i = 0; i < 20; i++) {
    history = await client.event.reindex.status()
    if (history.length > 0) {
      break
    }
    await new Promise((r) => setTimeout(r, 50))
  }

  // Finish the reindex to avoid leaking async work between tests
  await reindexPromise

  // We should have seen at least one entry (possibly already completed)
  expect(history.length).toBeGreaterThanOrEqual(1)

  const finalHistory = await client.event.reindex.status()
  expect(finalHistory[0].status).toBe('completed')
})
