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
import { intersectionBy } from 'lodash'
import {
  createPrng,
  generateUuid,
  Location,
  LocationType,
  SCOPES
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  // User missing required scope
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.locations.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Allows national system admin to set locations', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const locationRng = createPrng(846)
  await expect(
    dataSeedingClient.locations.set(generator.locations.set(1, locationRng))
  ).resolves.toEqual(undefined)
})

test('Prevents sending empty payload', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  await expect(
    dataSeedingClient.locations.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single location', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialLocations = await dataSeedingClient.locations.list()

  const locationPayload: Location[] = [
    {
      id: generateUuid(),
      parentId: null,
      name: 'Location foobar',
      validUntil: null,
      locationType: LocationType.enum.ADMIN_STRUCTURE
    }
  ]

  await dataSeedingClient.locations.set(locationPayload)

  const locations = await dataSeedingClient.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject(initialLocations.concat(locationPayload))
})

test('Creates multiple locations', async () => {
  const { user, generator, rng } = await setupTestCase()

  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialLocations = await dataSeedingClient.locations.list()

  const parentId = generateUuid(rng)

  const locationPayload = generator.locations.set(
    [{ id: parentId }, { parentId: parentId }, { parentId: parentId }, {}],
    rng
  )

  await dataSeedingClient.locations.set(locationPayload)

  const locations = await dataSeedingClient.locations.list()

  expect(locations).toEqual(initialLocations.concat(locationPayload))
})

test('seeding locations is additive, not destructive', async () => {
  const { user, generator, locations } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialLocations = await dataSeedingClient.locations.list()
  const locationRng = createPrng(847)
  const initialPayload = generator.locations.set(5, locationRng)

  await dataSeedingClient.locations.set(initialPayload)

  const locationAfterInitialSeed = await dataSeedingClient.locations.list()
  expect(locationAfterInitialSeed).toHaveLength(
    initialLocations.length + initialPayload.length
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedLocation, ...remainingLocationsPayload] = initialPayload

  await dataSeedingClient.locations.set(remainingLocationsPayload)

  const remainingLocationsAfterDeletion =
    await dataSeedingClient.locations.list()

  expect(remainingLocationsAfterDeletion).toStrictEqual(
    locationAfterInitialSeed
  )
})

/** Intermediary test until we clean up locations table */
test('administrative areas are seeded on both tables', async () => {
  const {
    user,
    generator,
    locations: initialLocations,
    eventsDb
  } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const locationRng = createPrng(847)
  const locationsPayload = generator.locations.set(20, locationRng)

  await dataSeedingClient.locations.set(locationsPayload)

  const locationsAfterSeeding = await dataSeedingClient.locations.list()
  expect(locationsAfterSeeding).toHaveLength(
    initialLocations.length + locationsPayload.length
  )

  const adminAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .selectAll()
    .execute()

  expect(adminAreas.length).toBeLessThan(locationsAfterSeeding.length)

  const adminAreasInLocationTable = locationsAfterSeeding.filter(
    (loc) => loc.locationType === LocationType.enum.ADMIN_STRUCTURE
  )

  expect(adminAreas).toHaveLength(
    locationsAfterSeeding.filter(
      (loc) => loc.locationType === LocationType.enum.ADMIN_STRUCTURE
    ).length
  )

  expect(
    intersectionBy(adminAreas, adminAreasInLocationTable, 'id')
  ).toHaveLength(adminAreas.length)
})

/** Intermediary test until we clean up locations table */
test('parent id is a duplicate of administrative area id in locations', async () => {
  const {
    user,
    generator,
    locations: initialLocations,
    eventsDb
  } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const locationRng = createPrng(123142)

  const parentAdminAreaId = generateUuid(locationRng)

  const locationsPayload: Location[] = [
    {
      id: parentAdminAreaId,
      parentId: null,
      locationType: LocationType.enum.ADMIN_STRUCTURE,
      name: 'Parent Admin Area',
      validUntil: null
    },
    {
      id: generateUuid(locationRng),
      parentId: parentAdminAreaId,
      locationType: LocationType.enum.ADMIN_STRUCTURE,
      name: 'Child Admin Area',
      validUntil: null
    },
    {
      id: generateUuid(locationRng),
      parentId: parentAdminAreaId,
      locationType: LocationType.enum.HEALTH_FACILITY,
      name: 'Child Health Facility',
      validUntil: null
    },
    {
      id: generateUuid(locationRng),
      parentId: parentAdminAreaId,
      locationType: LocationType.enum.CRVS_OFFICE,
      name: 'Child CRVS Office',
      validUntil: null
    }
  ]

  await dataSeedingClient.locations.set(locationsPayload)
  const adminAreas = await eventsDb
    .selectFrom('administrativeAreas')
    .select(['id', 'name', 'parentId', 'validUntil'])
    .execute()

  const locationsAfterSeeding = await eventsDb
    .selectFrom('locations')
    .select([
      'id',
      'name',
      'parentId',
      'validUntil',
      'administrativeAreaId',
      'locationType'
    ])
    .execute()

  expect({ adminAreas, locations: locationsAfterSeeding }).toMatchSnapshot()
})
