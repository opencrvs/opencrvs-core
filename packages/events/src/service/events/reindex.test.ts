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
  TENNIS_CLUB_MEMBERSHIP,
  TokenUserType
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createSystemTestClient,
  createTestToken,
  setupTestCase
} from '@events/tests/utils'
import {
  getEventAliasName,
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { runReindex } from '@events/service/events/reindex'

// Mock reindex endpoint so there are no side effects
vi.mock('@events/service/events/reindex', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@events/service/events/reindex')>()
  return {
    ...actual,
    reindex: vi.fn()
  }
})

const spy = vi.fn()

const postHandler = http.post(
  `${env.COUNTRY_CONFIG_URL}/reindex`,
  async (req) => {
    const body = await req.request.json()
    spy(body)

    return HttpResponse.json({})
  }
)

const silentPostHandler = http.post(`${env.COUNTRY_CONFIG_URL}/reindex`, () =>
  HttpResponse.json({})
)

const failingPostHandler = http.post(
  `${env.COUNTRY_CONFIG_URL}/reindex`,
  () => new HttpResponse(null, { status: 500 } as HttpResponseInit)
)

// Mock getEventConfigurations to return a single event config
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

let event: EventDocument

beforeEach(async () => {
  mswServer.use(singleEventConfigHandler, silentPostHandler)
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
  mswServer.use(postHandler)
  await runReindex(reindexToken)

  const esClient = getOrCreateClient()

  // Reindex doesn't refresh the index automatically, as it would block the event stream unnecessarily
  // So we need to manually refresh the index to see the changes
  await esClient.indices.refresh({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  })

  const body = await esClient.search({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(spy.mock.calls[0]).toHaveLength(1)
  // Does not reindex draftDocument - thus only one record is indexed
  expect(body.hits.hits).toHaveLength(1)
})

test('reindexing twice', async () => {
  await runReindex(reindexToken)
  await runReindex(reindexToken)
  await runReindex(reindexToken)

  const esClient = getOrCreateClient()

  await esClient.indices.refresh({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  })

  const body = await esClient.search({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
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

test('reindex given original concrete index is replaced by a timestamped index', async () => {
  const esClient = getOrCreateClient()

  const liveIndexName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)

  await runReindex(reindexToken)

  const allConcreteIndexes = (
    (await esClient.cat.indices({ format: 'json' })) as { index: string }[]
  ).map((i) => i.index)
  const liveIndexExistsAfterReindex = allConcreteIndexes.includes(liveIndexName)

  expect(liveIndexExistsAfterReindex).toBe(false)

  // The alias must still resolve to exactly one index
  const aliasInfo = await esClient.indices.getAlias({
    name: getEventAliasName()
  })

  const indexesBehindAlias = Object.keys(aliasInfo)
  expect(indexesBehindAlias).toHaveLength(1)
  expect(indexesBehindAlias[0]).toMatch(new RegExp(`^${liveIndexName}_\\d+$`))
})

test('reindex given first-reindex and concrete index conflicts with alias name - write alias created after removing original concrete index to avoid conflicts', async () => {
  const esClient = getOrCreateClient()

  const writeAliasName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)

  // Confirm we start with a bare concrete index (not yet an alias)
  const isConcreteBefore = await esClient.indices.exists({
    index: writeAliasName
  })
  const isAliasBefore = await esClient.indices.existsAlias({
    name: writeAliasName
  })
  expect(isConcreteBefore).toBe(true)
  expect(isAliasBefore).toBe(false)

  await runReindex(reindexToken)

  // After reindex the write alias must exist and point to a timestamped index
  const isAliasAfter = await esClient.indices.existsAlias({
    name: writeAliasName
  })
  expect(isAliasAfter).toBe(true)

  const writeAliasInfo = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexBehindWriteAlias = Object.keys(writeAliasInfo)[0]
  expect(indexBehindWriteAlias).toMatch(new RegExp(`^${writeAliasName}_\\d+$`))

  const allConcreteIndexes = (
    (await esClient.cat.indices({ format: 'json' })) as { index: string }[]
  ).map((i) => i.index)
  const isConcreteAfter = allConcreteIndexes.includes(writeAliasName)
  expect(isConcreteAfter).toBe(false)
})

test('reindex data is searchable via alias immediately after alias swap', async () => {
  const esClient = getOrCreateClient()

  await runReindex(reindexToken)

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

test('reindex on country config failure, temp index is cleaned up and no orphaned indexes remain', async () => {
  await runReindex(reindexToken)

  const esClient = getOrCreateClient()

  const aliasInfoBefore = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const liveIndexBefore = Object.keys(aliasInfoBefore)[0]

  // Simulate a failure on the next reindex
  mswServer.use(failingPostHandler)

  await runReindex(reindexToken).catch(() => {
    // Swallow the error to complete the test
  })

  // The alias must still point to the same index as before (live index untouched)
  const aliasInfoAfter = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const liveIndexAfter = Object.keys(aliasInfoAfter)[0]
  expect(liveIndexAfter).toEqual(liveIndexBefore)

  // There must be no orphaned temporary indexes l
  const aliasPrefix = getEventAliasName()
  const allIndexes = await esClient.cat.indices({ format: 'json' })
  const tempIndexes = (allIndexes as { index: string }[]).filter(
    ({ index }) =>
      index.startsWith(aliasPrefix) &&
      /_\d+$/.test(index) &&
      index !== liveIndexAfter
  )
  expect(tempIndexes).toHaveLength(0)
})

test('reindex events go to the correct (timestamped) index via write alias', async () => {
  const esClient = getOrCreateClient()

  // Perform a reindex so the live index becomes a timestamped index
  await runReindex(reindexToken)

  // Determine the current live (timestamped) physical index
  const globalAlias = getEventAliasName()
  const aliasInfo = await esClient.indices.getAlias({ name: globalAlias })
  const liveIndex = Object.keys(aliasInfo)[0]

  const writeAliasName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  const writeAliasInfo = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexBehindWriteAlias = Object.keys(writeAliasInfo)[0]

  expect(indexBehindWriteAlias).toEqual(liveIndex)
})

test('reindex per-type write alias is re-pointed on every subsequent reindex', async () => {
  const esClient = getOrCreateClient()

  await runReindex(reindexToken)

  const writeAliasName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  const aliasAfterFirst = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexAfterFirst = Object.keys(aliasAfterFirst)[0]

  // Second reindex — the write alias must point to the new index
  await runReindex(reindexToken)

  const aliasAfterSecond = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexAfterSecond = Object.keys(aliasAfterSecond)[0]

  expect(indexAfterSecond).not.toEqual(indexAfterFirst)
  expect(indexAfterSecond).toMatch(new RegExp(`^${writeAliasName}_\\d+$`))
})
