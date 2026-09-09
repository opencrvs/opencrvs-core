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
  createPrng,
  generateUuid,
  LocationVersion,
  SetLocationPayload,
  UUID
} from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createTestClient,
  setupTestCase,
  systemInitialisationTestSetup
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

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
