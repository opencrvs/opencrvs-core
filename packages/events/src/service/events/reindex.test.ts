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
  EventDocument,
  EventIndex,
  generateEventDocument,
  getUUID,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createSystemTestClient, setupTestCase } from '@events/tests/utils'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const spy = vi.fn()

const postHandler = http.post(
  `${env.COUNTRY_CONFIG_URL}/reindex`,
  async (req) => {
    const body = await req.request.json()
    spy(body)

    return HttpResponse.json({})
  }
)

const failingPostHandler = http.post(
  `${env.COUNTRY_CONFIG_URL}/reindex`,
  () => new HttpResponse(null, { status: 500 } as HttpResponseInit)
)

let event: EventDocument

beforeEach(async () => {
  mswServer.use(postHandler)
  spy.mockReset()
  const { user, eventsDb } = await setupTestCase()

  event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [
      { type: ActionType.CREATE, user },
      { type: ActionType.DECLARE, user }
    ]
  })

  const draftDocument = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE, user }]
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

  const drafteventInDb = await eventsDb
    .insertInto('events')
    .values({
      eventType: draftDocument.type,
      transactionId: getUUID(),
      trackingId: draftDocument.trackingId,
      createdAt: draftDocument.createdAt,
      updatedAt: draftDocument.updatedAt
    })
    .returning('id')
    .executeTakeFirst()

  await eventsDb
    .insertInto('eventActions')
    .values({
      id: getUUID(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      eventId: drafteventInDb!.id,
      actionType: ActionType.CREATE,
      createdBy: user.id,
      createdAt: event.createdAt,
      status: ActionStatus.Accepted,
      createdByRole: user.role,
      createdByUserType: 'user',
      transactionId: getUUID()
    })
    .execute()
})

test(`prevents forbidden access if missing required scope`, async () => {
  const client = createSystemTestClient('test-system', [])

  await expect(client.event.reindex()).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test('allows access with reindex scope', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])

  await expect(client.event.reindex()).resolves.not.toThrow()
})

test('reindexing indexes all events into Elasticsearch', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])

  await expect(client.event.reindex()).resolves.not.toThrow()

  const esClient = getOrCreateClient()

  // Reindex doesn't refresh the index automatically, as it would block the event stream unnecessarily
  // So we need to manually refresh the index to see the changes.
  // After a blue/green reindex the concrete index name changes, so we refresh via the alias.
  await esClient.indices.refresh({
    index: getEventAliasName()
  })

  const body = await esClient.search({
    index: getEventAliasName(),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  // spy is called once per batch; with 1 declared event, exactly one batch call is made
  expect(spy).toHaveBeenCalledTimes(1)
  // The body passed to country config is now an EventDocument[] array, not a stream
  expect(Array.isArray(spy.mock.calls[0][0])).toBe(true)
  expect(spy.mock.calls[0][0]).toHaveLength(1)
  // Does not reindex draftDocument - thus only one record is indexed
  expect(body.hits.hits).toHaveLength(1)
})

test('reindexing twice', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])

  await expect(client.event.reindex()).resolves.not.toThrow()
  await expect(client.event.reindex()).resolves.not.toThrow()
  await expect(client.event.reindex()).resolves.not.toThrow()

  const esClient = getOrCreateClient()

  // After a blue/green reindex the concrete index name changes, so we refresh via the alias.
  await esClient.indices.refresh({
    index: getEventAliasName()
  })

  const body = await esClient.search({
    index: getEventAliasName(),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(postHandler.isUsed).toBe(true)

  // Does not reindex draftDocument - thus only one record is indexed
  expect(body.hits.hits).toHaveLength(1)
  expect((body.hits.hits[0]._source as EventIndex).trackingId).toEqual(
    event.trackingId
  )
})

test('blue/green: original concrete index is replaced by a timestamped index after reindex', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  const esClient = getOrCreateClient()

  // The concrete index ({prefix}_{eventType}) should exist before reindex
  // from the server startup ensureIndexExists call
  const liveIndexName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)

  await expect(client.event.reindex()).resolves.not.toThrow()

  // After a blue/green reindex the original concrete index is deleted.
  // The alias now points to a new timestamped index.
  const liveIndexExistsAfterReindex = await esClient.indices.exists({
    index: liveIndexName
  })

  expect(liveIndexExistsAfterReindex).toBe(false)

  // The alias must still resolve to exactly one index
  const aliasInfo = await esClient.indices.getAlias({
    name: getEventAliasName()
  })

  const indexesBehindAlias = Object.keys(aliasInfo)
  expect(indexesBehindAlias).toHaveLength(1)
  // The surviving index name should contain the original name as a prefix
  expect(indexesBehindAlias[0]).toMatch(new RegExp(`^${liveIndexName}_\\d+$`))
})

test('blue/green: data is searchable via alias immediately after alias swap', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  const esClient = getOrCreateClient()

  await expect(client.event.reindex()).resolves.not.toThrow()

  await esClient.indices.refresh({ index: getEventAliasName() })

  const body = await esClient.search({
    index: getEventAliasName(),
    body: { query: { match_all: {} } }
  })

  // One declared event indexed; draft excluded
  expect(body.hits.hits).toHaveLength(1)
  expect((body.hits.hits[0]._source as EventIndex).trackingId).toEqual(
    event.trackingId
  )
})

test('blue/green: on country config failure, temp index is cleaned up and no orphaned indexes remain', async () => {
  // Establish a live index first with a successful reindex
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  await expect(client.event.reindex()).resolves.not.toThrow()

  const esClient = getOrCreateClient()

  // Capture index names after the first successful reindex
  const aliasInfoBefore = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const liveIndexBefore = Object.keys(aliasInfoBefore)[0]

  // Now simulate a failure on the next reindex
  mswServer.use(failingPostHandler)

  await expect(client.event.reindex()).resolves.not.toThrow()

  // Give the background task a chance to complete
  await new Promise((resolve) => setTimeout(resolve, 200))

  // The alias must still point to the same index as before (live index untouched)
  const aliasInfoAfter = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const liveIndexAfter = Object.keys(aliasInfoAfter)[0]
  expect(liveIndexAfter).toEqual(liveIndexBefore)

  // There must be no orphaned temporary indexes (the failed temp index cleaned up)
  const allIndexes = await esClient.cat.indices({ format: 'json' })
  const tempIndexes = (allIndexes as { index: string }[]).filter(
    ({ index }) => /_\d+$/.test(index) && index !== liveIndexAfter
  )
  expect(tempIndexes).toHaveLength(0)
})

test('reindex with eventType filter only rebuilds the specified event type index', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  const esClient = getOrCreateClient()

  // First full reindex to establish the live index
  await expect(client.event.reindex()).resolves.not.toThrow()

  const aliasInfoAfterFull = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const liveIndexAfterFull = Object.keys(aliasInfoAfterFull)[0]

  // Reindex only the tennis-club-membership event type
  await expect(
    client.event.reindex({ eventType: TENNIS_CLUB_MEMBERSHIP })
  ).resolves.not.toThrow()

  await esClient.indices.refresh({ index: getEventAliasName() })

  // The alias should have been swapped to a new temp index
  const aliasInfoAfterPartial = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const liveIndexAfterPartial = Object.keys(aliasInfoAfterPartial)[0]

  expect(liveIndexAfterPartial).not.toEqual(liveIndexAfterFull)
  expect(liveIndexAfterPartial).toMatch(
    new RegExp(`^${getEventIndexName(TENNIS_CLUB_MEMBERSHIP)}_\\d+$`)
  )

  // Data is still present after the partial reindex
  const body = await esClient.search({
    index: getEventAliasName(),
    body: { query: { match_all: {} } }
  })
  expect(body.hits.hits).toHaveLength(1)
})

test('blue/green: per-type write alias is created after reindex', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  const esClient = getOrCreateClient()

  await expect(client.event.reindex()).resolves.not.toThrow()

  // After reindex, events_birth should exist as an alias (not a concrete index)
  const writeAliasName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  const aliasExists = await esClient.indices.existsAlias({
    name: writeAliasName
  })
  expect(aliasExists).toBe(true)

  // The alias must point to the current timestamped index
  const writeAliasInfo = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexesBehindWriteAlias = Object.keys(writeAliasInfo)
  expect(indexesBehindWriteAlias).toHaveLength(1)
  expect(indexesBehindWriteAlias[0]).toMatch(
    new RegExp(`^${writeAliasName}_\\d+$`)
  )
})

test('blue/green: events indexed after reindex go to the correct (timestamped) index via write alias', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  const esClient = getOrCreateClient()

  // Perform a reindex so the live index becomes a timestamped index
  await expect(client.event.reindex()).resolves.not.toThrow()

  // Determine the current live (timestamped) physical index
  const globalAlias = getEventAliasName()
  const aliasInfo = await esClient.indices.getAlias({ name: globalAlias })
  const liveIndex = Object.keys(aliasInfo)[0]

  // The write alias (e.g. "events_tennis-club-membership") must resolve to the
  // same live timestamped index, not to a stale bare concrete index
  const writeAliasName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  const writeAliasInfo = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexBehindWriteAlias = Object.keys(writeAliasInfo)[0]

  expect(indexBehindWriteAlias).toEqual(liveIndex)
})

test('blue/green: per-type write alias is re-pointed on every subsequent reindex', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.RECORD_REINDEX])
  const esClient = getOrCreateClient()

  await expect(client.event.reindex()).resolves.not.toThrow()

  const writeAliasName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  const aliasAfterFirst = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexAfterFirst = Object.keys(aliasAfterFirst)[0]

  // Second reindex — the write alias must point to the new index
  await expect(client.event.reindex()).resolves.not.toThrow()

  const aliasAfterSecond = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexAfterSecond = Object.keys(aliasAfterSecond)[0]

  expect(indexAfterSecond).not.toEqual(indexAfterFirst)
  expect(indexAfterSecond).toMatch(new RegExp(`^${writeAliasName}_\\d+$`))
})
