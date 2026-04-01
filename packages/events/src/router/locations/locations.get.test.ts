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
import { createPrng, generateUuid, Location, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('Returns a single location by id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const location: Location = {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'Test location',
    validUntil: null,
    locationType: 'CRVS_OFFICE'
  }

  await client.locations.set([location])
  const result = await client.locations.get({ id: location.id })

  expect(result).toMatchObject(location)
})

test('Returns the correct location when multiple exist', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  const locationA: Location = {
    id: generateUuid(createPrng(1)),
    administrativeAreaId: null,
    name: 'Location A',
    validUntil: null,
    locationType: 'CRVS_OFFICE'
  }
  const locationB: Location = {
    id: generateUuid(createPrng(2)),
    administrativeAreaId: null,
    name: 'Location B',
    validUntil: null,
    locationType: 'CRVS_OFFICE'
  }

  await client.locations.set([locationA, locationB])
  const result = await client.locations.get({ id: locationA.id })

  expect(result).toMatchObject(locationA)
  expect(result.id).not.toBe(locationB.id)
})

test('Throws when location is not found', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.USER_DATA_SEEDING])

  await expect(client.locations.get({ id: generateUuid() })).rejects.toThrow()
})

test('Is accessible without elevated scopes', async () => {
  const { user } = await setupTestCase()
  const seeder = createTestClient(user, [SCOPES.USER_DATA_SEEDING])
  const reader = createTestClient(user, [])

  const location: Location = {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'Test location',
    validUntil: null,
    locationType: 'CRVS_OFFICE'
  }

  await seeder.locations.set([location])
  const result = await reader.locations.get({ id: location.id })

  expect(result).toMatchObject(location)
})
