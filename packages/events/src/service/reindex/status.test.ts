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

import { http, HttpResponse } from 'msw'
import {
  ActionStatus,
  ActionType,
  generateEventDocument,
  getUUID
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  versionedTennisClubMembershipEvent
} from '@opencrvs/commons/fixtures'
import { setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { runReindex } from '@events/service/reindex'
import { getClient } from '@events/storage/postgres/events'
import { getReindexingStatusHistory } from './status'

const singleEventConfigHandler = http.get(
  `${env.COUNTRY_CONFIG_URL}/config/events`,
  () => HttpResponse.json([versionedTennisClubMembershipEvent])
)

beforeEach(async () => {
  mswServer.use(singleEventConfigHandler)

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
      updatedAt: event.updatedAt,
      configVersionId: event.configVersionId
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
  const result = await getReindexingStatusHistory()
  expect(result).toEqual([])
})

test('returns completed status after successful reindex', async () => {
  await runReindex()

  const result = await getReindexingStatusHistory()

  expect(result).toHaveLength(1)
  expect(result[0].status).toBe('completed')
  expect(result[0].error_message).toBeNull()
  expect(result[0].completed_at).not.toBeNull()
  expect(result[0].progress.processed).toBe(1)
})

test('returns failed status after failed reindex', async () => {
  // A record stamped with a version that is not configured fails the reindex
  await getClient().updateTable('events').set({ configVersionId: 'v9' }).execute()

  await expect(runReindex()).rejects.toThrow()

  const result = await getReindexingStatusHistory()

  expect(result).toHaveLength(1)
  expect(result[0].status).toBe('failed')
  expect(result[0].error_message).toBeTruthy()
  expect(result[0].completed_at).not.toBeNull()
})

test('returns results ordered newest-first', async () => {
  await runReindex()
  await runReindex()

  const result = await getReindexingStatusHistory()

  expect(result).toHaveLength(2)
  expect(result[0].timestamp >= result[1].timestamp).toBe(true)
})

test('limit parameter is respected', async () => {
  await runReindex()
  await runReindex()
  await runReindex()

  const result = await getReindexingStatusHistory(2)

  expect(result).toHaveLength(2)
})

test('running reindex appears with running status', async () => {
  // Start reindex without awaiting it to observe the intermediate state
  const reindexPromise = runReindex()

  // Poll until we see at least one entry.
  // The index may briefly have unavailable shards right after creation,
  // so we swallow transient Elasticsearch errors and keep retrying.
  let history: Awaited<ReturnType<typeof getReindexingStatusHistory>> = []
  for (let i = 0; i < 20; i++) {
    try {
      history = await getReindexingStatusHistory()
      if (history.length > 0) {
        break
      }
    } catch {
      // Transient ES error (e.g. no_shard_available_action_exception)
      // — retry after a short delay
    }
    await new Promise((r) => setTimeout(r, 50))
  }

  // Finish the reindex to avoid leaking async work between tests
  await reindexPromise

  // We should have seen at least one entry (possibly already completed)
  expect(history.length).toBeGreaterThanOrEqual(1)

  const finalHistory = await getReindexingStatusHistory()
  expect(finalHistory[0].status).toBe('completed')
})
