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
import {
  createPrng,
  generateUuid,
  Location,
  encodeScope
} from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

const scope = encodeScope({ type: 'user.data-seeding' })

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
  const dataSeedingClient = createTestClient(user, [scope])

  const locationRng = createPrng(846)
  await expect(
    dataSeedingClient.locations.set(generator.locations.set(1, locationRng))
  ).resolves.toEqual(undefined)
})

test('Prevents sending empty payload', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  await expect(
    dataSeedingClient.locations.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single location', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const initialLocations = await dataSeedingClient.locations.list()

  const locationPayload: Location[] = [
    {
      id: generateUuid(),
      administrativeAreaId: null,
      name: 'Location foobar',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: 'abc123xyz456'
    }
  ]

  await dataSeedingClient.locations.set(locationPayload)

  const locations = await dataSeedingClient.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject(initialLocations.concat(locationPayload))
})

test('Creates multiple locations under administrative area', async () => {
  const { user, generator, rng } = await setupTestCase()

  const dataSeedingClient = createTestClient(user, [scope])

  const initialLocations = await dataSeedingClient.locations.list()

  const administrativeAreaId = generateUuid(rng)

  const administrativeAreaPayload = generator.administrativeAreas.set(
    [{ id: administrativeAreaId }],
    rng
  )
  const locationPayload = generator.locations.set(
    [{ administrativeAreaId }, { administrativeAreaId }, {}],
    rng
  )

  await dataSeedingClient.administrativeAreas.set(administrativeAreaPayload)
  await dataSeedingClient.locations.set(locationPayload)

  const locations = await dataSeedingClient.locations.list()

  expect(locations).toEqual(initialLocations.concat(locationPayload))
})

test('updates externalId on existing location when re-seeded with a value', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const locationId = generateUuid()

  await dataSeedingClient.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Location without external id',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: null
    }
  ])

  await dataSeedingClient.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Location without external id',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: 'pcode123'
    }
  ])

  const locations = await dataSeedingClient.locations.list()
  const updated = locations.find((l) => l.id === locationId)

  expect(updated?.externalId).toBe('pcode123')
})

test('stores a single active initial version when creating a location', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const locationId = generateUuid()

  await dataSeedingClient.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Versioned location',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: 'versioned-location-pcode'
    }
  ])

  const { versions } = await getClient()
    .selectFrom('locations')
    .select('versions')
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  // toEqual matches keys exactly, so this also asserts the version element
  // contains no parent reference (administrativeAreaId).
  expect(versions).toEqual([
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '0001-01-01',
      name: 'Versioned location',
      externalId: 'versioned-location-pcode',
      status: 'active'
    }
  ])
})

test('stores an additional inactive version when creating a location with validUntil', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const locationId = generateUuid()

  await dataSeedingClient.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Deprecated location',
      validUntil: '2027-03-15T23:30:00.000Z',
      locationType: 'CRVS_OFFICE',
      externalId: 'deprecated-location-pcode'
    }
  ])

  const { versions } = await getClient()
    .selectFrom('locations')
    .select('versions')
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  expect(versions).toEqual([
    {
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '0001-01-01',
      name: 'Deprecated location',
      externalId: 'deprecated-location-pcode',
      status: 'active'
    },
    {
      versionId: expect.stringMatching(UUID_REGEX),
      // UTC date part of the given validUntil
      effectiveFrom: '2027-03-15',
      name: 'Deprecated location',
      externalId: 'deprecated-location-pcode',
      status: 'inactive'
    }
  ])
})

test('does not modify versions when re-seeding an existing location with a new name', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const locationId = generateUuid()

  await dataSeedingClient.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Original name',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: 'renamed-location-pcode'
    }
  ])

  const { versions: versionsAfterInsert } = await getClient()
    .selectFrom('locations')
    .select('versions')
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  await dataSeedingClient.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Renamed location',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: 'renamed-location-pcode'
    }
  ])

  const updated = await getClient()
    .selectFrom('locations')
    .select(['name', 'versions'])
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  // The flat column updates, but re-seeding deliberately leaves versions
  // untouched: still the original single element with the original name.
  expect(updated.name).toBe('Renamed location')
  expect(updated.versions).toEqual(versionsAfterInsert)
  expect(updated.versions).toEqual([
    expect.objectContaining({ name: 'Original name', status: 'active' })
  ])
})

test('seeding locations is additive, not destructive', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

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
