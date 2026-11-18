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
import { generateOpenApiDocument } from 'trpc-to-openapi'
import * as z from 'zod/v4'
import {
  createPrng,
  encodeScope,
  generateUuid,
  Location,
  LocationVersion,
  SetLocationPayload,
  UUID
} from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createServiceTokenTestClient,
  createTestClient,
  setupTestCase,
  systemInitialisationTestSetup
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { appRouter } from '@events/router/router'

const locationEditScope = encodeScope({ type: 'location.edit' })

/** Moves every location's last write far into the past. */
async function ageAllLocations() {
  await getClient()
    .updateTable('locations')
    .set({ updatedAt: '2020-01-01T00:00:00.000Z' })
    .execute()
}

/**
 * A `since` that a client holds when it synced a while after
 * {@link ageAllLocations}: the aged rows are outside the sync window.
 */
const CURSOR_AFTER_AGED_ROWS = '2020-01-01T00:02:00.000Z'

async function setUpdatedAt(locationId: UUID, updatedAt: string) {
  await getClient()
    .updateTable('locations')
    .set({ updatedAt: sql`${updatedAt}::timestamptz` })
    .where('id', '=', locationId)
    .execute()
}

async function appendVersion(locationId: UUID, version: LocationVersion) {
  await getClient()
    .updateTable('locations')
    .set({ versions: sql`versions || ${JSON.stringify([version])}::jsonb` })
    .where('id', '=', locationId)
    .execute()
}

test('Returns single location in right format', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const initialLocations = await client.locations.list()

  const setLocationPayload: SetLocationPayload[] = [
    {
      id: generateUuid(),
      administrativeAreaId: null,
      name: 'Location foobar',
      locationType: 'CRVS_OFFICE',
      externalId: 'abc123xyz456'
    }
  ]

  await seeder.locations.set(setLocationPayload)

  const locations = await client.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject([...initialLocations, ...setLocationPayload])
})

test('Returns multiple locations', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const initialLocations = await client.locations.list()

  const locationRng = createPrng(845)
  await seeder.locations.set(generator.locations.set(5, locationRng))

  const locations = await client.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 5)
})

test('Returns the full versions array and resolves flat fields from the current version', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const locationId = generateUuid()

  await seeder.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Alaminos',
      locationType: 'CRVS_OFFICE',
      externalId: 'alaminos-pcode'
    }
  ])

  // A past-dated rename: this version is in effect today.
  await appendVersion(locationId, {
    versionId: generateUuid(),
    effectiveFrom: '2001-03-05',
    name: 'Alaminos City',
    externalId: 'alaminos-pcode',
    status: 'active'
  })

  const locations = await client.locations.list()
  const location = locations.find((l) => l.id === locationId)

  // Flat fields reflect the version valid now, not the original one.
  expect(location).toMatchObject({
    name: 'Alaminos City',
    status: 'active'
  })

  // The response carries every version, past and current.
  expect(location?.versions.map((v) => v.name)).toEqual([
    'Alaminos',
    'Alaminos City'
  ])
  expect(location?.versions).not.toHaveProperty('effectiveUntil')
})

test('A future-dated version is returned in versions but does not drive the flat fields', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const locationId = generateUuid()

  await seeder.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Current name',
      locationType: 'CRVS_OFFICE',
      externalId: 'future-rename-pcode'
    }
  ])

  await appendVersion(locationId, {
    versionId: generateUuid(),
    effectiveFrom: '2099-01-01',
    name: 'Future name',
    externalId: 'future-rename-pcode',
    status: 'active'
  })

  const locations = await client.locations.list()
  const location = locations.find((l) => l.id === locationId)

  expect(location?.name).toBe('Current name')
  expect(location?.versions).toHaveLength(2)
  expect(location?.versions[1]).toMatchObject({
    effectiveFrom: '2099-01-01',
    name: 'Future name'
  })
})

test('Filters locations by active status resolved from versions', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const locationId = generateUuid()

  await seeder.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Closed office',
      locationType: 'CRVS_OFFICE',
      externalId: 'closed-office-pcode'
    }
  ])

  // Inactivation is expressed as a version element with status 'inactive',
  // appended here directly in the database.
  await appendVersion(locationId, {
    versionId: generateUuid(),
    effectiveFrom: '2000-01-01',
    name: 'Closed office',
    externalId: 'closed-office-pcode',
    status: 'inactive'
  })

  const activeLocations = await client.locations.list({ isActive: true })
  expect(activeLocations.find((l) => l.id === locationId)).toBeUndefined()

  // Without the filter the inactive location is still returned, resolvable
  // by UUID, with its resolved status.
  const allLocations = await client.locations.list()
  const inactiveLocation = allLocations.find((l) => l.id === locationId)
  expect(inactiveLocation?.status).toBe('inactive')
})

test('A future-dated inactivation does not exclude a location from the active list yet', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])
  await systemInitialisationTestSetup()
  const seeder = createInitialisationTestClient()

  const locationId = generateUuid()

  await seeder.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Closing office',
      locationType: 'CRVS_OFFICE',
      externalId: 'closing-office-pcode'
    }
  ])

  await appendVersion(locationId, {
    versionId: generateUuid(),
    effectiveFrom: '2099-01-01',
    name: 'Closing office',
    externalId: 'closing-office-pcode',
    status: 'inactive'
  })

  const activeLocations = await client.locations.list({ isActive: true })

  expect(activeLocations.find((l) => l.id === locationId)).toMatchObject({
    status: 'active'
  })
})

test("Core's service token can list locations", async () => {
  const { user } = await setupTestCase()
  const userClient = createTestClient(user, [])
  const serviceTokenClient = await createServiceTokenTestClient()

  await expect(serviceTokenClient.locations.list()).resolves.toEqual(
    await userClient.locations.list()
  )
})

test('Documents the response as an array of locations, without validating it', () => {
  const document = generateOpenApiDocument(appRouter, {
    title: 'OpenCRVS API',
    version: '2.0.0',
    baseUrl: 'http://localhost:3000/api/events'
  })

  const response = document.paths?.['/locations']?.get?.responses?.['200']
  const schema =
    response && 'content' in response
      ? response.content?.['application/json']?.schema
      : undefined

  // The generator drops `$schema` when it inlines the response schema.
  const expected: Record<string, unknown> = z.toJSONSchema(z.array(Location), {
    io: 'output'
  })
  delete expected.$schema

  expect(schema).toEqual(expected)
})

describe('sync', () => {
  test('Returns updatedAt at millisecond precision on every location', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    const locations = await client.locations.list()

    expect(locations.length).toBeGreaterThan(0)
    for (const location of locations) {
      expect(location.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    }
  })

  test('Returns only locations written less than one minute before `since`, or later', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])
    const [older, atWindowStart, insideWindow] = (
      await client.locations.list()
    ).map((l) => l.id)

    await ageAllLocations()
    await setUpdatedAt(older, '2020-06-01T11:58:59.999Z')
    await setUpdatedAt(atWindowStart, '2020-06-01T11:59:00.000Z')
    await setUpdatedAt(insideWindow, '2020-06-01T11:59:00.001Z')

    const { locations } = await client.locations.sync({
      since: '2020-06-01T12:00:00.000Z'
    })

    expect(locations.map((l) => l.id)).toEqual([insideWindow])
  })

  test('Returns all locations when `since` is not given, and none again on the next sync', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])
    // A seed writes every row in one transaction, so all rows get the same
    // `updatedAt`. Age them, so that they are outside the window of the next sync.
    await ageAllLocations()
    const all = await client.locations.list()

    // The first fetch of a client has no cache, so it sends no `since`.
    const first = await client.locations.sync({})
    expect(first.locations.map((l) => l.id).sort()).toEqual(
      all.map((l) => l.id).sort()
    )

    const second = await client.locations.sync({ since: first.syncedAt })
    expect(second.locations).toEqual([])
  })

  test('Returns syncedAt from the database clock', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    const created = await client.locations.create({
      name: 'Clock Office',
      externalId: 'sync-clock-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2024-01-01',
      status: 'active'
    })

    const { syncedAt } = await client.locations.sync({
      since: CURSOR_AFTER_AGED_ROWS
    })

    expect(syncedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    expect(syncedAt >= created.updatedAt).toBe(true)
  })

  test('Returns a newly created location', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    await ageAllLocations()

    const created = await client.locations.create({
      name: 'New Office',
      externalId: 'sync-created-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2024-01-01',
      status: 'active'
    })

    const locations = (
      await client.locations.sync({ since: CURSOR_AFTER_AGED_ROWS })
    ).locations

    expect(locations).toEqual([created])
  })

  test('Returns a location with a backdated version and its whole history', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    const created = await client.locations.create({
      name: 'Old Name',
      externalId: 'sync-backdated-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2024-01-01',
      status: 'active'
    })
    await ageAllLocations()

    await client.locations.update({
      id: created.id,
      name: 'New Name',
      externalId: 'sync-backdated-pcode',
      status: 'active',
      effectiveFrom: '2025-01-01',
      lastVersionId: created.versions[0].versionId
    })

    const locations = (
      await client.locations.sync({ since: CURSOR_AFTER_AGED_ROWS })
    ).locations

    expect(locations).toHaveLength(1)
    expect(locations[0].versions.map((v) => v.name)).toEqual([
      'Old Name',
      'New Name'
    ])
  })

  test('Returns a location after a version is withdrawn, without that version', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    const created = await client.locations.create({
      name: 'Current Name',
      externalId: 'sync-withdrawn-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2024-01-01',
      status: 'active'
    })
    const updated = await client.locations.update({
      id: created.id,
      name: 'Future Name',
      externalId: 'sync-withdrawn-pcode',
      status: 'active',
      effectiveFrom: '2099-01-01',
      lastVersionId: created.versions[0].versionId
    })
    await ageAllLocations()

    await client.locations.withdrawVersion({
      id: created.id,
      versionId: updated.versions[1].versionId
    })

    const locations = (
      await client.locations.sync({ since: CURSOR_AFTER_AGED_ROWS })
    ).locations

    expect(locations).toHaveLength(1)
    expect(locations[0].versions.map((v) => v.name)).toEqual(['Current Name'])
  })

  test('Returns a reseeded location with its replaced history', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])
    await systemInitialisationTestSetup()
    const seeder = createInitialisationTestClient()

    const locationId = generateUuid()
    await seeder.locations.set([
      {
        id: locationId,
        administrativeAreaId: null,
        name: 'First seed',
        locationType: 'CRVS_OFFICE',
        externalId: 'sync-reseed-pcode'
      }
    ])
    await ageAllLocations()

    await seeder.locations.set([
      {
        id: locationId,
        administrativeAreaId: null,
        name: 'Second seed',
        locationType: 'CRVS_OFFICE',
        externalId: 'sync-reseed-pcode'
      }
    ])

    const locations = (
      await client.locations.sync({ since: CURSOR_AFTER_AGED_ROWS })
    ).locations

    expect(locations).toHaveLength(1)
    expect(locations[0]).toMatchObject({ id: locationId, name: 'Second seed' })
    expect(locations[0].versions.map((v) => v.name)).toEqual(['Second seed'])
  })

  test('Returns a location that became inactive', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [locationEditScope])
    const created = await client.locations.create({
      name: 'Closing Office',
      externalId: 'sync-inactive-pcode',
      administrativeAreaId: null,
      locationType: 'CRVS_OFFICE',
      effectiveFrom: '2024-01-01',
      status: 'active'
    })
    await ageAllLocations()

    await client.locations.update({
      id: created.id,
      name: 'Closing Office',
      externalId: 'sync-inactive-pcode',
      status: 'inactive',
      effectiveFrom: '2025-01-01',
      lastVersionId: created.versions[0].versionId
    })

    const locations = (
      await client.locations.sync({ since: CURSOR_AFTER_AGED_ROWS })
    ).locations

    expect(locations).toHaveLength(1)
    expect(locations[0]).toMatchObject({ id: created.id, status: 'inactive' })
  })

  test('Rejects since when it is not an ISO datetime', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.locations.sync({ since: 'yesterday' })
    ).rejects.toThrow()
  })
})
