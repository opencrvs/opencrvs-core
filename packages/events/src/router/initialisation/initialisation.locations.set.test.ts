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
import {
  createPrng,
  generateUuid,
  SetLocationPayload,
  TokenUserType
} from '@opencrvs/commons'
import {
  createInternalServiceToken,
  createInitialisationTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES,
  UUID_REGEX
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { payloadGenerator } from '@events/tests/generators'

const locationPayload: SetLocationPayload[] = [
  {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'New Administrative Area',
    locationType: 'test-location-type',
    externalId: 'abc123xyz456'
  }
]

test('Returns 403 after initialisation is completed', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()
  await expect(client.complete()).resolves.toBeUndefined()

  await expect(client.locations.set(locationPayload)).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with user app token', async () => {
  const { user } = await setupTestCase()
  await systemInitialisationTestSetup()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInitialisationTestClient(appToken)

  await expect(client.locations.set([])).rejects.toMatchObject(
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

  await expect(client.locations.set(locationPayload)).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  await systemInitialisationTestSetup()

  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })

  const client = createInitialisationTestClient(internalToken)

  await expect(client.locations.set(locationPayload)).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Prevents sending empty payload', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()

  await expect(client.locations.set([])).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single location', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()

  await client.locations.set(locationPayload)

  const eventsDb = getClient()

  const locations = await eventsDb.selectFrom('locations').selectAll().execute()

  expect(locations).toHaveLength(1)
  expect(locations[0]).toMatchObject(locationPayload[0])
})

test('Creates multiple locations under parent administrative area', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()

  const rng = createPrng(123123)
  const administrativeAreaId = generateUuid(rng)

  const generator = payloadGenerator(rng)
  const administrativeAreaPayload = generator.administrativeAreas.set(
    [{ id: administrativeAreaId }],
    rng
  )

  await client.administrativeAreas.set(administrativeAreaPayload)

  const eventsDb = getClient()

  const multipleLocationsPayload = generator.locations.set(
    [{ administrativeAreaId }, { administrativeAreaId }, {}],
    rng
  )
  await client.locations.set(multipleLocationsPayload)

  const locations = await eventsDb.selectFrom('locations').selectAll().execute()

  for (const location of locations) {
    const found = multipleLocationsPayload.find((l) => l.id === location.id)
    expect(found).toBeDefined()
    expect(location).toMatchObject({
      ...found
    })
  }
})

test('updates externalId on existing location when re-seeded with a value', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()

  const locationId = generateUuid()
  const eventsDb = getClient()

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Location without external id',
      locationType: 'CRVS_OFFICE',
      externalId: null
    }
  ])

  const locationsBeforeUpdate = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .execute()

  expect(locationsBeforeUpdate).toHaveLength(1)

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Location without external id',
      locationType: 'CRVS_OFFICE',
      externalId: 'adminpcode123'
    }
  ])

  const locationsAfterUpdate = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .execute()

  expect(locationsAfterUpdate).toHaveLength(1)

  const updated = locationsAfterUpdate.find((a) => a.id === locationId)

  expect(updated?.externalId).toBe('adminpcode123')
})

test('seeding locations is additive, not destructive', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()

  const eventsDb = getClient()

  const administrativeAreaRng = createPrng(1236123)
  const generator = payloadGenerator(administrativeAreaRng)

  const initialPayload = generator.locations.set(5, administrativeAreaRng)

  await client.locations.set(initialPayload)

  const locationsAfterInitialSeed = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .execute()

  expect(locationsAfterInitialSeed).toHaveLength(initialPayload.length)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedLocation, ...remainingLocationsPayload] = initialPayload
  await client.locations.set(remainingLocationsPayload)

  const locationsAfterOmittingOne = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .execute()

  expect(locationsAfterOmittingOne).toHaveLength(
    locationsAfterInitialSeed.length
  )

  for (const remainingLocation of locationsAfterOmittingOne) {
    const found = locationsAfterInitialSeed.find(
      (a) => a.id === remainingLocation.id
    )
    expect(found).toBeDefined()
    // `versions` is excluded: a re-seed replaces the history, and a payload
    // carrying none rebuilds a single element with a fresh versionId. This
    // test is about rows surviving an omission, not about history.
    expect(remainingLocation).toMatchObject({
      ...found,
      updatedAt: expect.any(String),
      versions: expect.any(Array)
    })
  }
})

test('stores a single active initial version when creating a location', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const locationId = generateUuid()

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Versioned location',
      locationType: 'CRVS_OFFICE',
      externalId: 'versioned-location-pcode'
    }
  ])

  const eventsDb = getClient()
  const { versions } = await eventsDb
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

test('replaces versions when re-seeding an existing location with a new name', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const locationId = generateUuid()

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Original name',
      locationType: 'CRVS_OFFICE',
      externalId: 'renamed-location-pcode'
    }
  ])

  const eventsDb = getClient()
  const { versions: versionsAfterInsert } = await eventsDb
    .selectFrom('locations')
    .select('versions')
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  await client.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Renamed location',
      locationType: 'CRVS_OFFICE',
      externalId: 'renamed-location-pcode'
    }
  ])

  const updated = await eventsDb
    .selectFrom('locations')
    .select(['name', 'versions'])
    .where('id', '=', locationId)
    .executeTakeFirstOrThrow()

  // Re-seeding replaces the stored history with the incoming one. A payload
  // carrying no `versions` therefore resets the row to a single element built
  // from its flat fields — including a freshly generated versionId.
  expect(updated.name).toBe('Renamed location')
  expect(updated.versions).not.toEqual(versionsAfterInsert)
  expect(updated.versions).toEqual([
    expect.objectContaining({
      versionId: expect.stringMatching(UUID_REGEX),
      effectiveFrom: '0001-01-01',
      name: 'Renamed location',
      status: 'active'
    })
  ])
})
