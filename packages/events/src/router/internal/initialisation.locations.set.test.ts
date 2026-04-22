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
  Location,
  TokenUserType
} from '@opencrvs/commons'
import {
  createInternalServiceToken,
  createInternalTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'
import { payloadGenerator } from '@events/tests/generators'

test('Returns 403 when accessed with user app token', async () => {
  const { user } = await setupTestCase()
  await systemInitialisationTestSetup()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInternalTestClient(appToken)

  await expect(client.initialisation.locations.set([])).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

const locationPayload: Location[] = [
  {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'New Administrative Area',
    locationType: 'test-location-type',
    validUntil: null,
    externalId: 'abc123xyz456'
  }
]

test('Returns 403 when accessed with system app token', async () => {
  const systemToken = createTestToken({
    userId: 'test-system',
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  await systemInitialisationTestSetup()

  const client = createInternalTestClient(systemToken)

  await expect(
    client.initialisation.locations.set(locationPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })
  await systemInitialisationTestSetup()

  const client = createInternalTestClient(internalToken)

  await expect(
    client.initialisation.locations.set(locationPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Prevents sending empty payload', async () => {
  const client = createInternalTestClient()

  await expect(
    client.initialisation.locations.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single location', async () => {
  const client = createInternalTestClient()

  await client.initialisation.locations.set(locationPayload)

  const eventsDb = getClient()

  const locations = await eventsDb.selectFrom('locations').selectAll().execute()

  expect(locations).toHaveLength(1)
  expect(locations[0]).toMatchObject(locationPayload[0])
})

test('Creates multiple locations under parent administrative area', async () => {
  const client = createInternalTestClient()

  const rng = createPrng(123123)
  const administrativeAreaId = generateUuid(rng)

  const generator = payloadGenerator(rng)
  const administrativeAreaPayload = generator.administrativeAreas.set(
    [{ id: administrativeAreaId }],
    rng
  )

  await client.initialisation.administrativeAreas.set(administrativeAreaPayload)

  const eventsDb = getClient()

  const multipleLocationsPayload = generator.locations.set(
    [{ administrativeAreaId }, { administrativeAreaId }, {}],
    rng
  )
  await client.initialisation.locations.set(multipleLocationsPayload)

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
  const client = createInternalTestClient()

  const locationId = generateUuid()
  const eventsDb = getClient()

  await client.initialisation.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Location without external id',
      locationType: 'CRVS_OFFICE',
      validUntil: null,
      externalId: null
    }
  ])

  const locationsBeforeUpdate = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .execute()

  expect(locationsBeforeUpdate).toHaveLength(1)

  await client.initialisation.locations.set([
    {
      id: locationId,
      administrativeAreaId: null,
      name: 'Location without external id',
      locationType: 'CRVS_OFFICE',
      validUntil: null,
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
  const client = createInternalTestClient()

  const eventsDb = getClient()

  const administrativeAreaRng = createPrng(1236123)
  const generator = payloadGenerator(administrativeAreaRng)

  const initialPayload = generator.locations.set(5, administrativeAreaRng)

  await client.initialisation.locations.set(initialPayload)

  const locationsAfterInitialSeed = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .execute()

  expect(locationsAfterInitialSeed).toHaveLength(initialPayload.length)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedLocation, ...remainingLocationsPayload] = initialPayload
  await client.initialisation.locations.set(remainingLocationsPayload)

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
    expect(remainingLocation).toMatchObject({
      ...found,
      updatedAt: expect.any(String)
    })
  }
})
