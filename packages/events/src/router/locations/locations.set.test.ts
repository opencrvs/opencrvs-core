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
import { generateUuid, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { Location } from '@events/service/locations/locations'

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

  await expect(
    dataSeedingClient.locations.set(generator.locations.set(1))
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

  const initialLocations = await dataSeedingClient.locations.get()

  const locationPayload: Location[] = [
    {
      id: generateUuid(),
      parentId: null,
      name: 'Location foobar',
      validUntil: null,
      locationType: 'ADMIN_STRUCTURE'
    }
  ]

  await dataSeedingClient.locations.set(locationPayload)

  const locations = await dataSeedingClient.locations.get()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject(initialLocations.concat(locationPayload))
})

test('Creates multiple locations', async () => {
  const { user, generator, rng } = await setupTestCase()

  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialLocations = await dataSeedingClient.locations.get()

  const parentId = generateUuid(rng)

  const locationPayload = generator.locations.set([
    { id: parentId },
    { parentId: parentId },
    { parentId: parentId },
    {}
  ])

  await dataSeedingClient.locations.set(locationPayload)

  const locations = await dataSeedingClient.locations.get()

  expect(locations).toEqual(initialLocations.concat(locationPayload))
})

test('seeding locations is additive, not destructive', async () => {
  const { user, generator } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const initialLocations = await dataSeedingClient.locations.get()

  const initialPayload = generator.locations.set(5)

  await dataSeedingClient.locations.set(initialPayload)

  const locationAfterInitialSeed = await dataSeedingClient.locations.get()
  expect(locationAfterInitialSeed).toHaveLength(
    initialLocations.length + initialPayload.length
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_removedLocation, ...remainingLocationsPayload] = initialPayload

  await dataSeedingClient.locations.set(remainingLocationsPayload)

  const remainingLocationsAfterDeletion =
    await dataSeedingClient.locations.get()

  expect(remainingLocationsAfterDeletion).toStrictEqual(
    locationAfterInitialSeed
  )
})
