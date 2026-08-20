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
/* eslint-disable max-lines */
import { TRPCError } from '@trpc/server'
import {
  SetAdministrativeAreaPayload,
  createPrng,
  generateUuid,
  TokenUserType
} from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES,
  createInitialisationToken,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { getLeafLevelAdministrativeAreaIds } from '@events/storage/postgres/administrative-hierarchy/locations'
import { payloadGenerator } from '@events/tests/generators'

const administrativeAreaPayload: SetAdministrativeAreaPayload[] = [
  {
    id: generateUuid(),
    parentId: null,
    name: 'New Administrative Area',
    externalId: 'abc123xyz456'
  }
]

test('Returns 403 after initialisation is completed', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()
  await expect(client.complete()).resolves.toBeUndefined()

  await expect(
    client.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with user app token', async () => {
  await systemInitialisationTestSetup()
  const { user } = await setupTestCase()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInitialisationTestClient(appToken)

  await expect(client.administrativeAreas.set([])).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with system app token', async () => {
  await systemInitialisationTestSetup()
  const systemToken = createTestToken({
    userId: TEST_SYSTEM_ID,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  const client = createInitialisationTestClient(systemToken)

  await expect(
    client.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  await systemInitialisationTestSetup()
  const internalToken = createInitialisationToken({
    subject: 'invalid-subject'
  })

  const client = createInitialisationTestClient(internalToken)

  await expect(
    client.administrativeAreas.set(administrativeAreaPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Prevents sending empty payload', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  await expect(
    client.administrativeAreas.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single administrative area', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  await client.administrativeAreas.set(administrativeAreaPayload)

  const eventsDb = getClient()

  const administrativeAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreas).toHaveLength(1)
  expect(administrativeAreas[0]).toMatchObject(administrativeAreaPayload[0])
})

test('Creates multiple administrative areas under parent administrative area', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const rng = createPrng(123123)
  const parentAdministrativeAreaId = generateUuid(rng)

  const payload = payloadGenerator(rng).administrativeAreas.set(
    [
      { id: parentAdministrativeAreaId },
      { parentId: parentAdministrativeAreaId },
      { parentId: parentAdministrativeAreaId },
      {}
    ],
    rng
  )

  await client.administrativeAreas.set(payload)

  const eventsDb = getClient()
  const administrativeAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreas).toHaveLength(payload.length)

  for (const administrativeArea of payload) {
    const found = administrativeAreas.find(
      (a) => a.id === administrativeArea.id
    )
    expect(found).toBeDefined()
    expect(found).toMatchObject(administrativeArea)
  }
})

test('updates externalId on existing administrative area when re-seeded with a value', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const areaId = generateUuid()
  const eventsDb = getClient()

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Area without external id',
      externalId: null
    }
  ])

  const areasBeforeUpdate = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(areasBeforeUpdate).toHaveLength(1)

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Area without external id',
      externalId: 'adminpcode123'
    }
  ])

  const areasAfterUpdate = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(areasAfterUpdate).toHaveLength(1)

  const updated = areasAfterUpdate.find((a) => a.id === areaId)

  expect(updated?.externalId).toBe('adminpcode123')
})

test('seeding administrative areas is additive, not destructive', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const eventsDb = getClient()

  const administrativeAreaRng = createPrng(1236123)
  const generator = payloadGenerator(administrativeAreaRng)

  const initialPayload = generator.administrativeAreas.set(
    5,
    administrativeAreaRng
  )

  await client.administrativeAreas.set(initialPayload)

  const administrativeAreasAfterInitialSeed = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreasAfterInitialSeed).toHaveLength(
    initialPayload.length
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedAdministrativeArea, ...remainingAdministrativeAreasPayload] =
    initialPayload
  await client.administrativeAreas.set(remainingAdministrativeAreasPayload)

  const administrativeAreasAferOmittingOne = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(administrativeAreasAferOmittingOne).toHaveLength(
    administrativeAreasAfterInitialSeed.length
  )

  for (const remainingArea of administrativeAreasAferOmittingOne) {
    const found = administrativeAreasAfterInitialSeed.find(
      (a) => a.id === remainingArea.id
    )
    expect(found).toBeDefined()
    // `versionId` is excluded: a re-seed replaces the history, and a payload
    // carrying none rebuilds a single element with a fresh versionId. This
    // test is about rows surviving an omission, not about history.
    expect(remainingArea).toMatchObject({
      ...found,
      updatedAt: expect.any(String),
      versions: [
        {
          effectiveFrom: expect.any(String),
          name: expect.any(String),
          externalId: expect.any(String),
          status: expect.any(String)
        }
      ]
    })
  }
})

test('stores a single active initial version when creating an administrative area', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const areaId = generateUuid()

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Versioned administrative area',
      externalId: 'versioned-area-pcode'
    }
  ])

  const { versions } = await getClient()
    .selectFrom('administrativeAreas')
    .select('versions')
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  // toEqual matches keys exactly, so this also asserts the version element
  // contains no parent reference (parentId).
  expect(versions).toEqual([
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '0001-01-01',
      name: 'Versioned administrative area',
      externalId: 'versioned-area-pcode',
      status: 'active'
    }
  ])
})

function uuidFactory(seed: number) {
  const rng = createPrng(seed)

  return () => generateUuid(rng)
}

test('stores a supplied multi-element history verbatim', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(90001)
  const areaId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Ibombo District',
      externalId: 'ibombo-district-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2014-08-02',
      name: 'Ibombo District (renamed)',
      externalId: 'ibombo-district-pcode',
      status: 'inactive' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2021-05-19',
      name: 'Ibombo District (reopened)',
      externalId: 'ibombo-district-pcode',
      status: 'active' as const
    }
  ]

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Ibombo District (stale flat value)',
      externalId: 'ibombo-district-pcode',
      versions
    }
  ])

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['name', 'externalId', 'versions'])
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual(versions)
  // Legacy columns are aligned with the history: `name` is the snapshot in
  // effect today, and external_id holds the payload's code.
  expect(row.name).toBe('Ibombo District (reopened)')
  expect(row.externalId).toBe('ibombo-district-pcode')
})

test('a supplied history is readable through the API with resolved flat fields', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(90002)

  const areaId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Ilanga District',
      externalId: 'ilanga-district-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2018-03-11',
      name: 'Ilanga District (renamed)',
      externalId: 'ilanga-district-pcode',
      status: 'active' as const
    }
  ]

  await client.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Ilanga District (renamed)',
      externalId: 'ilanga-district-pcode',
      versions
    }
  ])

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select('versions')
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual(versions)
})

// Seeding is only reachable while initialisation is incomplete, so a repeated
// seed means a retried initialisation — not a change to a live hierarchy.
test('a repeated seed with a longer history replaces the stored one', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(90003)

  const areaId = uuid()
  const firstVersion = {
    versionId: uuid(),
    effectiveFrom: '0001-01-01',
    name: 'Itambo District',
    externalId: 'itambo-district-pcode',
    status: 'active' as const
  }
  const identity = {
    id: areaId,
    parentId: null,
    name: 'Itambo District',
    externalId: 'itambo-district-pcode'
  }

  await client.administrativeAreas.set([
    { ...identity, versions: [firstVersion] }
  ])

  const extendedVersions = [
    firstVersion,
    {
      versionId: uuid(),
      effectiveFrom: '2022-09-30',
      name: 'Itambo District (renamed)',
      externalId: 'itambo-district-pcode',
      status: 'active' as const
    }
  ]

  await client.administrativeAreas.set([
    { ...identity, versions: extendedVersions }
  ])

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select('versions')
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual(extendedVersions)
})

test('a repeated seed carrying no history replaces the stored one with a single version', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(90004)

  const areaId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Isamba District',
      externalId: 'isamba-district-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2016-11-04',
      name: 'Isamba District (renamed)',
      externalId: 'isamba-district-pcode',
      status: 'active' as const
    }
  ]
  const identity = {
    id: areaId,
    parentId: null,
    name: 'Isamba District (renamed)',
    externalId: 'isamba-district-pcode'
  }

  await client.administrativeAreas.set([{ ...identity, versions }])

  // The config declares no history for this row, so the incoming single
  // element replaces the stored one. Carrying a history through a repeated
  // seed requires sending it every time.
  await client.administrativeAreas.set([
    { ...identity, name: 'Isamba District (re-seeded)' }
  ])

  const row = await getClient()
    .selectFrom('administrativeAreas')
    .select(['name', 'versions'])
    .where('id', '=', areaId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual([
    expect.objectContaining({
      effectiveFrom: '0001-01-01',
      name: 'Isamba District (re-seeded)',
      status: 'active'
    })
  ])
  expect(row.name).toBe('Isamba District (re-seeded)')
})

test('mixes areas with and without a supplied history in one call', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(90005)

  const withHistoryId = uuid()
  const withoutHistoryId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Irundu District',
      externalId: 'irundu-district-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2020-02-20',
      name: 'Irundu District (renamed)',
      externalId: 'irundu-district-pcode',
      status: 'active' as const
    }
  ]

  await client.administrativeAreas.set([
    {
      id: withHistoryId,
      parentId: null,
      name: 'Irundu District (renamed)',
      externalId: 'irundu-district-pcode',
      versions
    },
    {
      id: withoutHistoryId,
      parentId: null,
      name: 'Zobwe District',
      externalId: 'zobwe-district-pcode'
    }
  ])

  const rows = await getClient()
    .selectFrom('administrativeAreas')
    .select(['id', 'externalId', 'versions'])
    .execute()

  const withHistory = rows.find((row) => row.id === withHistoryId)
  const withoutHistory = rows.find((row) => row.id === withoutHistoryId)

  expect(withHistory?.versions).toEqual(versions)
  expect(withoutHistory?.versions).toHaveLength(1)
  expect(withoutHistory?.externalId).toBe('zobwe-district-pcode')
})

test('rejects a non-ascending supplied history', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(90006)

  await expect(
    client.administrativeAreas.set([
      {
        id: uuid(),
        parentId: null,
        name: 'Pili District',
        externalId: 'pili-district-pcode',
        versions: [
          {
            versionId: uuid(),
            effectiveFrom: '2020-01-01',
            name: 'Pili District (renamed)',
            externalId: null,
            status: 'active'
          },
          {
            versionId: uuid(),
            effectiveFrom: '0001-01-01',
            name: 'Pili District',
            externalId: null,
            status: 'active'
          }
        ]
      }
    ])
  ).rejects.toThrow()
})

test('invalidates the leaf-level administrative area cache', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const before = await getLeafLevelAdministrativeAreaIds()

  // generateUuid() with no argument draws from a constant rng, so a second
  // call without one would collide with the first — use an advancing PRNG
  // for distinct ids instead.
  const uuid = uuidFactory(90007)
  const parentId = uuid()
  const areaId = uuid()

  await client.administrativeAreas.set([
    { id: parentId, parentId: null, name: 'Parent Area', externalId: null },
    {
      id: areaId,
      parentId,
      name: 'New Leaf Area',
      externalId: 'leaf-cache-set-pcode'
    }
  ])

  const after = await getLeafLevelAdministrativeAreaIds()

  expect(after).not.toBe(before)
  expect(after.map((row) => row.id)).toContain(areaId)
  // parentId now has a child, so it must have dropped out of the leaf set.
  expect(after.map((row) => row.id)).not.toContain(parentId)
})
