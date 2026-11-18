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
import { sql } from 'kysely'
import {
  SetAdministrativeAreaPayload,
  UUID,
  createPrng,
  encodeScope,
  generateUuid
} from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createTestClient,
  setupTestCase,
  systemInitialisationTestSetup
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

const locationEditScope = encodeScope({ type: 'location.edit' })

/** Moves every administrative area's last write far into the past. */
async function ageAllAdministrativeAreas() {
  await getClient()
    .updateTable('administrativeAreas')
    .set({ updatedAt: '2020-01-01T00:00:00.000Z' })
    .execute()
}

/** A `since` outside the sync window of the rows aged by {@link ageAllAdministrativeAreas}. */
const CURSOR_AFTER_AGED_ROWS = '2020-01-01T00:02:00.000Z'

async function setUpdatedAt(id: UUID, updatedAt: string) {
  await getClient()
    .updateTable('administrativeAreas')
    .set({ updatedAt: sql`${updatedAt}::timestamptz` })
    .where('id', '=', id)
    .execute()
}

test('Returns new administrative area after it has been added', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  const setAdministrativeAreaPayload: SetAdministrativeAreaPayload[] = [
    {
      id: generateUuid(() => 0.1235),
      parentId: null,
      name: 'New Administrative Area',
      externalId: generateUuid(() => 0.1231)
    }
  ]

  await seeder.administrativeAreas.set(setAdministrativeAreaPayload)
  const administrativeAreas = await client.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 1
  )
  expect(administrativeAreas).toMatchObject([
    ...initialAdministrativeAreas,
    ...setAdministrativeAreaPayload
  ])
})

test('Returns multiple administrative areas', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const initialAdministrativeAreas = await client.administrativeAreas.list()
  const administratieAreaRng = createPrng(12312312)
  await seeder.administrativeAreas.set(
    generator.administrativeAreas.set(5, administratieAreaRng)
  )

  const administrativeAreas = await client.administrativeAreas.list()

  expect(administrativeAreas).toHaveLength(
    initialAdministrativeAreas.length + 5
  )
})

test('Filters administrative areas by ids', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  const id = initialAdministrativeAreas[0].id

  const administrativeAreas = await client.administrativeAreas.list({
    ids: [id]
  })

  expect(administrativeAreas).toHaveLength(1)

  expect(administrativeAreas[0].id).toBe(id)
})

test('Returns the full versions array and resolves flat fields from the current version', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const areaId = generateUuid()

  await seeder.administrativeAreas.set([
    {
      id: areaId,
      parentId: null,
      name: 'Old District',
      externalId: 'renamed-district-pcode'
    }
  ])

  // A past-dated rename: this version is in effect today.
  await getClient()
    .updateTable('administrativeAreas')
    .set({
      versions: sql`versions || ${JSON.stringify([
        {
          versionId: generateUuid(() => 0.5678),
          effectiveFrom: '2010-06-30',
          name: 'New District',
          externalId: 'renamed-district-pcode',
          status: 'active'
        }
      ])}::jsonb`
    })
    .where('id', '=', areaId)
    .execute()

  const areas = await client.administrativeAreas.list()
  const area = areas.find((a) => a.id === areaId)

  expect(area).toMatchObject({
    name: 'New District',
    status: 'active'
  })
  expect(area?.versions.map((v) => v.name)).toEqual([
    'Old District',
    'New District'
  ])
})

test('Filters administrative areas by active status', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  const initialAdministrativeAreas = await client.administrativeAreas.list()

  expect(initialAdministrativeAreas.length).toBe(5)

  const administrativeAreaIdToUpdate = initialAdministrativeAreas[0].id

  // Inactivation is expressed as a version element with status 'inactive',
  // appended here directly in the database.
  const inactiveVersion = JSON.stringify([
    {
      versionId: generateUuid(() => 0.4321),
      effectiveFrom: '2000-01-01',
      name: 'Inactivated area',
      externalId: null,
      status: 'inactive'
    }
  ])

  await getClient()
    .updateTable('administrativeAreas')
    .set({ versions: sql`versions || ${inactiveVersion}::jsonb` })
    .where('id', '=', administrativeAreaIdToUpdate)
    .execute()

  const administrativeAreas = await client.administrativeAreas.list({
    isActive: true
  })

  expect(administrativeAreas.length).toBe(initialAdministrativeAreas.length - 1)

  expect(
    administrativeAreas.find((aa) => aa.id === administrativeAreaIdToUpdate)
  ).toBeUndefined()
})

describe('sync', () => {
  test('Returns updatedAt at millisecond precision on every administrative area', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    const administrativeAreas = await client.administrativeAreas.list()

    expect(administrativeAreas.length).toBeGreaterThan(0)
    for (const area of administrativeAreas) {
      expect(area.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    }
  })

  test('Returns only administrative areas written less than one minute before `since`, or later', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])
    const [older, atWindowStart, insideWindow] = (
      await client.administrativeAreas.list()
    ).map((a) => a.id)

    await ageAllAdministrativeAreas()
    await setUpdatedAt(older, '2020-06-01T11:58:59.999Z')
    await setUpdatedAt(atWindowStart, '2020-06-01T11:59:00.000Z')
    await setUpdatedAt(insideWindow, '2020-06-01T11:59:00.001Z')

    const { administrativeAreas } = await client.administrativeAreas.sync({
      since: '2020-06-01T12:00:00.000Z'
    })

    expect(administrativeAreas.map((a) => a.id)).toEqual([insideWindow])
  })

  test('Returns all administrative areas when `since` is not given, and none again on the next sync', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])
    // Age the seeded rows, so that they are outside the window of the next sync.
    await ageAllAdministrativeAreas()
    const all = await client.administrativeAreas.list()

    // The first fetch of a client has no cache, so it sends no `since`.
    const first = await client.administrativeAreas.sync({})
    expect(first.administrativeAreas.map((a) => a.id).sort()).toEqual(
      all.map((a) => a.id).sort()
    )

    const second = await client.administrativeAreas.sync({
      since: first.syncedAt
    })
    expect(second.administrativeAreas).toEqual([])
  })

  test('Returns a newly created administrative area', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    await ageAllAdministrativeAreas()

    const created = await client.administrativeAreas.create({
      name: 'New District',
      externalId: 'sync-created-area-pcode',
      parentId: null,
      effectiveFrom: '2024-01-01',
      status: 'active'
    })

    await expect(
      client.administrativeAreas.sync({ since: CURSOR_AFTER_AGED_ROWS })
    ).resolves.toMatchObject({ administrativeAreas: [created] })
  })

  test('Returns an administrative area with a new version and its whole history', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    const created = await client.administrativeAreas.create({
      name: 'Old District',
      externalId: 'sync-updated-area-pcode',
      parentId: null,
      effectiveFrom: '2024-01-01',
      status: 'active'
    })
    await ageAllAdministrativeAreas()

    await client.administrativeAreas.update({
      id: created.id,
      name: 'Renamed District',
      externalId: 'sync-updated-area-pcode',
      status: 'active',
      effectiveFrom: '2025-01-01',
      lastVersionId: created.versions[0].versionId
    })

    const { administrativeAreas } = await client.administrativeAreas.sync({
      since: CURSOR_AFTER_AGED_ROWS
    })

    expect(administrativeAreas).toHaveLength(1)
    expect(administrativeAreas[0].versions.map((v) => v.name)).toEqual([
      'Old District',
      'Renamed District'
    ])
  })

  test('Returns a reseeded administrative area', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])
    await systemInitialisationTestSetup()
    const seeder = createInitialisationTestClient()

    const id = generateUuid()
    await seeder.administrativeAreas.set([
      { id, parentId: null, name: 'First seed', externalId: 'sync-reseed-area' }
    ])
    await ageAllAdministrativeAreas()

    await seeder.administrativeAreas.set([
      {
        id,
        parentId: null,
        name: 'Second seed',
        externalId: 'sync-reseed-area'
      }
    ])

    const { administrativeAreas } = await client.administrativeAreas.sync({
      since: CURSOR_AFTER_AGED_ROWS
    })

    expect(administrativeAreas).toHaveLength(1)
    expect(administrativeAreas[0]).toMatchObject({ id, name: 'Second seed' })
  })
})
