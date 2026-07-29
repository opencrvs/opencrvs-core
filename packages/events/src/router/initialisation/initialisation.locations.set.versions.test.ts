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

/**
 * Seeding locations with a pre-built `versions` history. Split out of
 * initialisation.locations.set.test.ts to keep both files under the max-lines
 * limit.
 */

import { createPrng, generateUuid } from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  systemInitialisationTestSetup
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

/**
 * `generateUuid()` with no argument draws from a constant rng, so every call
 * returns the same id. A version history needs distinct `versionId`s, so the
 * tests below draw from an advancing PRNG instead.
 */
function uuidFactory(seed: number) {
  const rng = createPrng(seed)

  return () => generateUuid(rng)
}

test('stores a supplied multi-element history verbatim', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(91001)

  const locationId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Ilanga Office',
      externalId: 'ilanga-office-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2014-08-02',
      name: 'Ilanga Office (renamed)',
      externalId: 'ilanga-office-pcode',
      status: 'inactive' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2021-05-19',
      name: 'Ilanga Office (reopened)',
      externalId: 'ilanga-office-pcode',
      status: 'active' as const
    }
  ]

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Ilanga Office (stale flat value)',
      locationType: 'CRVS_OFFICE',
      externalId: 'ilanga-office-pcode',
      versions
    }
  ])

  const eventsDb = getClient()
  const row = await eventsDb
    .selectFrom('locations')
    .select(['name', 'externalId', 'versions'])
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual(versions)
  // Flat columns are aligned with the history: `name` is the snapshot in
  // effect today, and external_id holds the payload's code.
  expect(row.name).toBe('Ilanga Office (reopened)')
  expect(row.externalId).toBe('ilanga-office-pcode')
})

test('a supplied history is readable through the API with resolved flat fields', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(91002)

  const locationId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Itambo Office',
      externalId: 'itambo-office-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2018-03-11',
      name: 'Itambo Office (renamed)',
      externalId: 'itambo-office-pcode',
      status: 'active' as const
    }
  ]

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Itambo Office (renamed)',
      locationType: 'CRVS_OFFICE',
      externalId: 'itambo-office-pcode',
      versions
    }
  ])

  const [location] = await client.locations.list({ locationIds: [locationId] })

  expect(location.versions).toEqual(versions)
  expect(location.name).toBe('Itambo Office (renamed)')
  expect(location.externalId).toBe('itambo-office-pcode')
  expect(location.status).toBe('active')
})

// Seeding is only reachable while initialisation is incomplete, so a repeated
// seed means a retried initialisation — not a change to a live hierarchy.
test('a repeated seed with a longer history replaces the stored one', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(91003)

  const locationId = uuid()
  const firstVersion = {
    versionId: uuid(),
    effectiveFrom: '0001-01-01',
    name: 'Isamba Office',
    externalId: 'isamba-office-pcode',
    status: 'active' as const
  }
  const identity = {
    id: locationId,
    administrativeAreaId: null,
    name: 'Isamba Office',
    locationType: 'CRVS_OFFICE',
    externalId: 'isamba-office-pcode'
  }

  await client.locations.set([{ ...identity, versions: [firstVersion] }])

  const extendedVersions = [
    firstVersion,
    {
      versionId: uuid(),
      effectiveFrom: '2022-09-30',
      name: 'Isamba Office (renamed)',
      externalId: 'isamba-office-pcode',
      status: 'active' as const
    }
  ]

  await client.locations.set([{ ...identity, versions: extendedVersions }])

  const eventsDb = getClient()
  const row = await eventsDb
    .selectFrom('locations')
    .select('versions')
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual(extendedVersions)
})

test('a repeated seed carrying no history replaces the stored one with a single version', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(91004)

  const locationId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Irundu Office',
      externalId: 'irundu-office-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2016-11-04',
      name: 'Irundu Office (renamed)',
      externalId: 'irundu-office-pcode',
      status: 'active' as const
    }
  ]
  const identity = {
    id: locationId,
    administrativeAreaId: null,
    name: 'Irundu Office (renamed)',
    locationType: 'CRVS_OFFICE',
    externalId: 'irundu-office-pcode'
  }

  await client.locations.set([{ ...identity, versions }])

  // The config declares no history for this row, so the incoming single
  // element replaces the stored one. Carrying a history through a repeated
  // seed requires sending it every time.
  await client.locations.set([
    { ...identity, name: 'Irundu Office (re-seeded)' }
  ])

  const eventsDb = getClient()
  const row = await eventsDb
    .selectFrom('locations')
    .select(['name', 'versions'])
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  expect(row.versions).toEqual([
    expect.objectContaining({
      effectiveFrom: '0001-01-01',
      name: 'Irundu Office (re-seeded)',
      status: 'active'
    })
  ])
  expect(row.name).toBe('Irundu Office (re-seeded)')
})

test('mixes rows with and without a supplied history in one call', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(91005)

  const withHistoryId = uuid()
  const withoutHistoryId = uuid()
  const versions = [
    {
      versionId: uuid(),
      effectiveFrom: '0001-01-01',
      name: 'Zobwe Office',
      externalId: 'zobwe-office-pcode',
      status: 'active' as const
    },
    {
      versionId: uuid(),
      effectiveFrom: '2020-02-20',
      name: 'Zobwe Office (renamed)',
      externalId: 'zobwe-office-pcode',
      status: 'active' as const
    }
  ]

  await client.locations.set([
    {
      id: withHistoryId,
      administrativeAreaId: null,
      name: 'Zobwe Office (renamed)',
      locationType: 'CRVS_OFFICE',
      externalId: 'zobwe-office-pcode',
      versions
    },
    {
      id: withoutHistoryId,
      administrativeAreaId: null,
      name: 'Chibiya Office',
      locationType: 'CRVS_OFFICE',
      externalId: 'chibiya-office-pcode'
    }
  ])

  const eventsDb = getClient()
  const rows = await eventsDb
    .selectFrom('locations')
    .select(['id', 'name', 'externalId', 'versions'])
    .execute()

  const withHistory = rows.find((row) => row.id === withHistoryId)
  const withoutHistory = rows.find((row) => row.id === withoutHistoryId)

  expect(withHistory?.versions).toEqual(versions)
  expect(withoutHistory?.versions).toHaveLength(1)
  expect(withoutHistory?.externalId).toBe('chibiya-office-pcode')
})

test('rejects a non-ascending supplied history', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const uuid = uuidFactory(91006)

  await expect(
    client.locations.set([
      {
        id: uuid(),
        administrativeAreaId: null,
        name: 'Pili Office',
        locationType: 'CRVS_OFFICE',
        externalId: 'pili-office-pcode',
        versions: [
          {
            versionId: uuid(),
            effectiveFrom: '2020-01-01',
            name: 'Pili Office (renamed)',
            externalId: null,
            status: 'active'
          },
          {
            versionId: uuid(),
            effectiveFrom: '0001-01-01',
            name: 'Pili Office',
            externalId: null,
            status: 'active'
          }
        ]
      }
    ])
  ).rejects.toThrow()
})
