/* eslint-disable max-lines */
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

import { inject } from 'vitest'
import { http, HttpResponse } from 'msw'
import {
  ActionStatus,
  ActionType,
  createPrng,
  EventDocument,
  EventIndex,
  generateEventDocument,
  generateUuid,
  getUUID,
  INITIAL_EVENT_CONFIG_VERSION_ID,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  versionedTennisClubMembershipEvent
} from '@opencrvs/commons/fixtures'
import { setupTestCase } from '@events/tests/utils'
import {
  getEventAliasName,
  getEventIndexName,
  getEventVersionIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { runReindex } from '@events/service/reindex'
import {
  ReindexAlreadyRunningError,
  withReindexLock
} from '@events/service/reindex/lock'
import { getReindexingStatusHistory } from '@events/service/reindex/status'
import { cleanupOrphanedIndices } from '@events/service/reindex/indexing'
import { getLocations } from '@events/storage/postgres/administrative-hierarchy/locations'
import { getClient } from '@events/storage/postgres/events'
import * as elasticsearchMocks from '@events/storage/__mocks__/elasticsearch'
import { getEventIndexName as getEventIndexNameMock } from '@events/storage/__mocks__/elasticsearch'

// Mock getEventConfigurations to return a single event config
const singleEventConfigHandler = http.get(
  `${env.COUNTRY_CONFIG_URL}/config/events`,
  () => HttpResponse.json([versionedTennisClubMembershipEvent])
)

async function insertUnreadableEvent(event: EventDocument) {
  // An event without actions cannot be turned into a document
  return getClient()
    .insertInto('events')
    .values({
      eventType: event.type,
      transactionId: getUUID(),
      trackingId: getUUID(),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      configVersionId: event.configVersionId
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

async function getLiveAndTemporaryIndices() {
  const esClient = getOrCreateClient()
  const aliasInfo = await esClient.indices.getAlias({
    name: getEventAliasName()
  })
  const [liveIndex] = Object.keys(aliasInfo)
  const allIndexes = (await esClient.cat.indices({ format: 'json' })) as {
    index: string
  }[]
  const temporaryIndices = allIndexes
    .map(({ index }) => index)
    .filter(
      (index) =>
        index.startsWith(getEventAliasName()) &&
        /_\d+$/.test(index) &&
        index !== liveIndex
    )
  return { liveIndex, temporaryIndices }
}

let event: EventDocument
let rngNumber = 949
beforeEach(async () => {
  mswServer.use(singleEventConfigHandler)
  const { user, eventsDb, seed } = await setupTestCase()

  const rng = createPrng(rngNumber)

  const adminLevel1Id = generateUuid(rng)
  const adminLevel2Id = generateUuid(rng)
  const crvsOfficeId = generateUuid(rng)

  await seed.administrativeAreas([
    {
      name: 'Adming level 1',
      parentId: null,
      externalId: 'AS0978ASD2A',
      id: adminLevel1Id
    },
    {
      name: 'Admin level 2',
      parentId: adminLevel1Id,
      externalId: 'AS0978ASD2B',
      id: adminLevel2Id
    }
  ])
  await seed.locations([
    {
      name: 'Location within Admin level 2',
      administrativeAreaId: adminLevel2Id,
      externalId: 'AS0978ASD2C',
      locationType: 'CRVS_OFFICE',
      id: crvsOfficeId
    }
  ])

  rngNumber++

  event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    rng,
    actions: [
      { type: ActionType.CREATE, user },
      { type: ActionType.DECLARE, user }
    ]
  })

  const locations = await getLocations()

  const crvsOffice = locations.find((x) => x.id === crvsOfficeId)

  const draftDocument = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    rng,
    actions: [{ type: ActionType.CREATE, user }]
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
      createdAtLocation: crvsOffice?.id,
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
      createdAtLocation: crvsOffice?.id,
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
      updatedAt: draftDocument.updatedAt,
      configVersionId: draftDocument.configVersionId
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
      createdAtLocation: crvsOffice?.id,
      createdAt: event.createdAt,
      status: ActionStatus.Accepted,
      createdByRole: user.role,
      createdByUserType: 'user',
      transactionId: getUUID()
    })
    .execute()
})

test('reindexing indexes all events into Elasticsearch', async () => {
  await runReindex()

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

  // Does not reindex draftDocument - thus only one record is indexed
  expect(body.hits.hits).toHaveLength(1)
})

test('reindexing twice', async () => {
  await runReindex()
  await runReindex()
  await runReindex()

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

  // Does not reindex draftDocument - thus only one record is indexed
  expect(body.hits.hits).toHaveLength(1)
  expect((body.hits.hits[0]._source as EventIndex).trackingId).toEqual(
    event.trackingId
  )
})

test('reindex given original concrete index of a version is replaced by a timestamped index', async () => {
  const esClient = getOrCreateClient()

  const liveIndexName = getEventVersionIndexName(
    TENNIS_CLUB_MEMBERSHIP,
    INITIAL_EVENT_CONFIG_VERSION_ID
  )

  const indicesPointingToAlias = Object.keys(
    await esClient.indices.getAlias({
      name: getEventAliasName()
    })
  )

  expect(indicesPointingToAlias).toContain(liveIndexName)

  await runReindex()

  const indicesPointingToAliasAfter = Object.keys(
    await esClient.indices.getAlias({
      name: getEventAliasName()
    })
  )

  // Expect original liveIndexName to not be pointing to the alias anymore
  expect(indicesPointingToAliasAfter).not.toContain(liveIndexName)

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

test('reindex given first-reindex and concrete index of a version conflicts with alias name - write alias created after removing original concrete index to avoid conflicts', async () => {
  const esClient = getOrCreateClient()

  const writeAliasName = getEventVersionIndexName(
    TENNIS_CLUB_MEMBERSHIP,
    INITIAL_EVENT_CONFIG_VERSION_ID
  )

  // Confirm we start with a bare concrete index (not yet an alias)
  const isConcreteBefore = await esClient.indices.exists({
    index: writeAliasName
  })
  const isAliasBefore = await esClient.indices.existsAlias({
    name: writeAliasName
  })
  expect(isConcreteBefore).toBe(true)
  expect(isAliasBefore).toBe(false)

  await runReindex()

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

  await runReindex()

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

test('runReindex sends no request other than reading the event configurations', async () => {
  const requests: string[] = []
  const onRequest = ({ request }: { request: Request }) => {
    if (!request.url.includes(inject('ELASTICSEARCH_URI'))) {
      requests.push(`${request.method} ${request.url}`)
    }
  }
  mswServer.events.on('request:start', onRequest)

  try {
    await runReindex()
  } finally {
    mswServer.events.removeListener('request:start', onRequest)
  }

  for (const request of requests) {
    expect(request).toBe(`GET ${env.COUNTRY_CONFIG_URL}/config/events`)
  }
})

test('runReindex records completed status in reindexing_status index', async () => {
  await runReindex()

  const history = await getReindexingStatusHistory()

  expect(history).toHaveLength(1)
  expect(history[0].status).toBe('completed')
  expect(history[0].error_message).toBeNull()
  expect(history[0].completed_at).not.toBeNull()
  expect(history[0].progress.processed).toBeGreaterThanOrEqual(0)
})

test('runReindex fails when a record cannot be read, and keeps the live index', async () => {
  await runReindex()
  const before = await getLiveAndTemporaryIndices()

  await insertUnreadableEvent(event)

  await expect(runReindex()).rejects.toThrow()

  const after = await getLiveAndTemporaryIndices()
  expect(after.liveIndex).toEqual(before.liveIndex)
  expect(after.temporaryIndices).toHaveLength(0)

  const [latest] = await getReindexingStatusHistory()
  expect(latest.status).toBe('failed')
  expect(latest.error_message).toBeTruthy()
  expect(latest.completed_at).not.toBeNull()
})

test('runReindex fails when an event is stamped with a version that is not configured', async () => {
  await getClient()
    .updateTable('events')
    .set({ configVersionId: 'v9' })
    .where('trackingId', '=', event.trackingId)
    .execute()

  await expect(runReindex()).rejects.toThrow(
    `Event '${TENNIS_CLUB_MEMBERSHIP}' has no version 'v9'`
  )

  const history = await getReindexingStatusHistory()

  expect(history).toHaveLength(1)
  expect(history[0].status).toBe('failed')
})

test('a second reindex that starts while one runs fails and does not change the indices', async () => {
  await runReindex()
  const before = await getLiveAndTemporaryIndices()
  const historyBefore = await getReindexingStatusHistory()

  const second = vi.fn(async () => runReindex())
  await withReindexLock(async () => {
    await expect(withReindexLock(second)).rejects.toThrow(
      ReindexAlreadyRunningError
    )
  })

  expect(second).not.toHaveBeenCalled()
  expect(await getLiveAndTemporaryIndices()).toEqual(before)
  expect(await getReindexingStatusHistory()).toEqual(historyBefore)
})

test('the reindex lock is free again after a reindex fails', async () => {
  await expect(
    withReindexLock(async () => Promise.reject(new Error('simulated failure')))
  ).rejects.toThrow('simulated failure')

  await expect(withReindexLock(async () => runReindex())).resolves.not.toThrow()
})

test('reindex per-version write alias is re-pointed on every subsequent reindex', async () => {
  const esClient = getOrCreateClient()

  await runReindex()

  const writeAliasName = getEventVersionIndexName(
    TENNIS_CLUB_MEMBERSHIP,
    INITIAL_EVENT_CONFIG_VERSION_ID
  )
  const aliasAfterFirst = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexAfterFirst = Object.keys(aliasAfterFirst)[0]

  // Second reindex — the write alias must point to the new index
  await runReindex()

  const aliasAfterSecond = await esClient.indices.getAlias({
    name: writeAliasName
  })
  const indexAfterSecond = Object.keys(aliasAfterSecond)[0]

  expect(indexAfterSecond).not.toEqual(indexAfterFirst)
  expect(indexAfterSecond).toMatch(new RegExp(`^${writeAliasName}_\\d+$`))
})

test('reindex deletes the index of a version that was removed from the config', async () => {
  const esClient = getOrCreateClient()
  const [initialVersion] = versionedTennisClubMembershipEvent.versions
  const v2Name = getEventVersionIndexName(TENNIS_CLUB_MEMBERSHIP, 'v2')

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
      HttpResponse.json([
        {
          ...versionedTennisClubMembershipEvent,
          versions: [
            initialVersion,
            { ...initialVersion, id: 'v2', effectiveFrom: '2999-01-01' }
          ]
        }
      ])
    )
  )
  await runReindex()
  const [v2Index] = Object.keys(
    await esClient.indices.getAlias({ name: v2Name })
  )

  // v2 never took effect, so no record uses it and it can be removed.
  mswServer.use(singleEventConfigHandler)
  await runReindex()

  expect(await esClient.indices.exists({ index: v2Index })).toBe(false)

  const eventIndexName = getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  await esClient.indices.refresh({ index: eventIndexName })
  const body = await esClient.search({
    index: eventIndexName,
    body: { query: { match_all: {} } }
  })
  // The declared record of the initial version is still found; the draft is not indexed.
  expect(body.hits.hits).toHaveLength(1)
})

test('does not stop runReindex when the cleanup itself fails', async () => {
  const esClient = getOrCreateClient()
  const clientSpy = vi
    .spyOn(elasticsearchMocks, 'getOrCreateClient')
    .mockReturnValue(esClient)
  // The cleanup makes the first getAlias call in runReindex.
  const getAliasSpy = vi
    .spyOn(esClient.indices, 'getAlias')
    .mockRejectedValueOnce(new Error('simulated getAlias failure'))

  await expect(runReindex()).resolves.not.toThrow()
  expect(getAliasSpy).toHaveBeenCalled()

  getAliasSpy.mockRestore()
  clientSpy.mockRestore()

  const history = await getReindexingStatusHistory()
  expect(history[0].status).toBe('completed')
})

describe('cleanupOrphanedIndices', () => {
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

  // The default test mock names indices `<type>_<id>`; switch to production's
  // `<prefix>_<type>` shape so the names match what a real cluster holds.
  function useProductionIndexNames() {
    const prefix = getEventAliasName()
    getEventIndexNameMock.mockImplementation(
      (type: string) => `${prefix}_${type}`
    )
  }

  test('deletes an old temp index with no alias', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    const orphanIndex = `${getEventIndexNameMock(TENNIS_CLUB_MEMBERSHIP)}_${Date.now() - TWO_DAYS_MS}`
    await esClient.indices.create({ index: orphanIndex })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: orphanIndex })).toBe(false)
  })

  test('deletes an old temp index of a version with no alias', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    const versionIndexName = getEventVersionIndexName(
      TENNIS_CLUB_MEMBERSHIP,
      INITIAL_EVENT_CONFIG_VERSION_ID
    )
    const orphanIndex = `${versionIndexName}_${Date.now() - TWO_DAYS_MS}`
    await esClient.indices.create({ index: orphanIndex })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: orphanIndex })).toBe(false)
  })

  test('leaves the bare index of a version (no timestamp suffix) untouched even without an alias', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    const versionIndexName = getEventVersionIndexName(
      TENNIS_CLUB_MEMBERSHIP,
      INITIAL_EVENT_CONFIG_VERSION_ID
    )
    await esClient.indices.create({ index: versionIndexName })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: versionIndexName })).toBe(
      true
    )
  })

  test('leaves a recent temp index alone, as it may belong to an in-progress reindex', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    const inProgressIndex = `${getEventIndexNameMock(TENNIS_CLUB_MEMBERSHIP)}_${Date.now()}`
    await esClient.indices.create({ index: inProgressIndex })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: inProgressIndex })).toBe(true)
  })

  test('leaves an old temp index that is still behind an alias', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    const liveIndex = `${getEventIndexNameMock(TENNIS_CLUB_MEMBERSHIP)}_${Date.now() - TWO_DAYS_MS}`
    await esClient.indices.create({
      index: liveIndex,
      aliases: { [getEventAliasName()]: {} }
    })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: liveIndex })).toBe(true)
  })

  test('leaves a bare live index (no timestamp suffix) untouched even without an alias', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    // A bare live index has no alias before its first-ever reindex.
    const liveIndexName = getEventIndexNameMock(TENNIS_CLUB_MEMBERSHIP)
    await esClient.indices.create({ index: liveIndexName })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: liveIndexName })).toBe(true)
  })

  test('leaves the bare live index of an event type whose id ends in digits', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    // `<prefix>_marriage_2025` ends in `_<digits>`, so a loose suffix match
    // would mistake it for a temp index.
    const configuration = {
      ...versionedTennisClubMembershipEvent,
      id: 'marriage_2025'
    }
    const liveIndexName = getEventIndexNameMock(configuration.id)
    await esClient.indices.create({ index: liveIndexName })

    await cleanupOrphanedIndices([configuration])

    expect(await esClient.indices.exists({ index: liveIndexName })).toBe(true)
  })

  test('ignores indices of event types that are not configured', async () => {
    const esClient = getOrCreateClient()
    useProductionIndexNames()

    const foreignIndex = `${getEventIndexNameMock('not-configured')}_${Date.now() - TWO_DAYS_MS}`
    await esClient.indices.create({ index: foreignIndex })

    await cleanupOrphanedIndices([versionedTennisClubMembershipEvent])

    expect(await esClient.indices.exists({ index: foreignIndex })).toBe(true)
  })

  test('logs and continues when deleting an orphaned index fails', async () => {
    const esClient = getOrCreateClient()
    // Each getOrCreateClient() call opens a new connection, so make it reuse
    // esClient -- otherwise cleanupOrphanedIndices would get its own client,
    // and the delete spy below wouldn't see its calls.
    vi.spyOn(elasticsearchMocks, 'getOrCreateClient').mockReturnValue(esClient)
    useProductionIndexNames()

    const orphanIndex = `${getEventIndexNameMock(TENNIS_CLUB_MEMBERSHIP)}_${Date.now() - TWO_DAYS_MS}`
    await esClient.indices.create({ index: orphanIndex })

    const deleteSpy = vi
      .spyOn(esClient.indices, 'delete')
      .mockRejectedValueOnce(new Error('simulated delete failure'))

    // A failed delete must not throw out of cleanupOrphanedIndices -- it's a
    // best-effort step that shouldn't be able to block the reindex it precedes.
    await expect(
      cleanupOrphanedIndices([versionedTennisClubMembershipEvent])
    ).resolves.not.toThrow()

    expect(deleteSpy).toHaveBeenCalledWith({ index: orphanIndex })
    deleteSpy.mockRestore()

    // Deletion failed, so the index is still there.
    expect(await esClient.indices.exists({ index: orphanIndex })).toBe(true)
  })
})
