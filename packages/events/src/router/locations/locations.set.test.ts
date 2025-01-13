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
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { userScopes } from '@opencrvs/commons'

test('prevents unauthorized access from registrar', async () => {
  const { user } = await setupTestCase()
  const registrarClient = createTestClient(user)

  await expect(
    registrarClient.locations.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Allows national system admin to set locations', async () => {
  const { user, generator } = await setupTestCase()
  const nationalSystemAdminClient = createTestClient(user, [
    userScopes.nationalSystemAdmin
  ])

  await expect(
    nationalSystemAdminClient.locations.set(generator.locations.set(1))
  ).resolves.toEqual(undefined)
})

test('Prevents sending empty payload', async () => {
  const { user } = await setupTestCase()
  const nationalSystemAdminClient = createTestClient(user, [
    userScopes.nationalSystemAdmin
  ])

  await expect(
    nationalSystemAdminClient.locations.set([])
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Creates single location', async () => {
  const { user } = await setupTestCase()
  const nationalSystemAdminClient = createTestClient(user, [
    userScopes.nationalSystemAdmin
  ])

  const locationPayload = [
    {
      id: '123-456-789',
      partOf: null,
      name: 'Location foobar',
      externalId: 'foo-bar'
    }
  ]

  await nationalSystemAdminClient.locations.set(locationPayload)

  const locations = await nationalSystemAdminClient.locations.get()

  expect(locations).toHaveLength(1)
  expect(locations).toMatchObject(locationPayload)
})

test('Creates multiple locations', async () => {
  const { user, generator } = await setupTestCase()
  const nationalSystemAdminClient = createTestClient(user, [
    userScopes.nationalSystemAdmin
  ])

  const parentId = 'parent-id'

  const locationPayload = generator.locations.set([
    { id: 'parentId' },
    { partOf: parentId },
    { partOf: parentId },
    {}
  ])

  await nationalSystemAdminClient.locations.set(locationPayload)

  const locations = await nationalSystemAdminClient.locations.get()

  expect(locations).toEqual(locationPayload)
})

test('Removes existing locations not in payload', async () => {
  const { user, generator } = await setupTestCase()
  const nationalSystemAdminClient = createTestClient(user, [
    userScopes.nationalSystemAdmin
  ])

  const initialPayload = generator.locations.set(5)

  await nationalSystemAdminClient.locations.set(initialPayload)

  const initialLocations = await nationalSystemAdminClient.locations.get()
  expect(initialLocations).toHaveLength(initialPayload.length)

  const [removedLocation, ...remainingLocationsPayload] = initialPayload

  await nationalSystemAdminClient.locations.set(remainingLocationsPayload)

  const remainingLocationsAfterDeletion =
    await nationalSystemAdminClient.locations.get()

  expect(remainingLocationsAfterDeletion).toHaveLength(
    remainingLocationsPayload.length
  )

  expect(
    remainingLocationsAfterDeletion.some(
      (location) => location.id === removedLocation.id
    )
  ).toBe(false)
})
