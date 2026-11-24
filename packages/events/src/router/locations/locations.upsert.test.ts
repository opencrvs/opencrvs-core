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
import { generateUuid, Location, encodeScope } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

const scope = encodeScope({ type: 'user.data-seeding' })

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  // User missing required scope
  const registrarClient = createTestClient(user)

  const locationPayload: Location = {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'Location foobar',
    validUntil: null,
    locationType: 'CRVS_OFFICE',
    externalId: null
  }

  await expect(
    registrarClient.locations.upsert(locationPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Allows national system admin to upsert a location', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const locationPayload: Location = {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'Location foobar',
    validUntil: null,
    locationType: 'CRVS_OFFICE',
    externalId: null
  }

  await expect(
    dataSeedingClient.locations.upsert(locationPayload)
  ).resolves.toEqual(undefined)
})

test('Creates a new location', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const initialLocations = await dataSeedingClient.locations.list()

  const locationPayload: Location = {
    id: generateUuid(),
    administrativeAreaId: null,
    name: 'Location foobar',
    validUntil: null,
    locationType: 'CRVS_OFFICE',
    externalId: 'abc123xyz456'
  }

  await dataSeedingClient.locations.upsert(locationPayload)

  const locations = await dataSeedingClient.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject(initialLocations.concat([locationPayload]))
})

test('updates an existing location when re-posted with the same id', async () => {
  const { user } = await setupTestCase()
  const dataSeedingClient = createTestClient(user, [scope])

  const locationId = generateUuid()

  await dataSeedingClient.locations.upsert({
    id: locationId,
    administrativeAreaId: null,
    name: 'Location without external id',
    validUntil: null,
    locationType: 'CRVS_OFFICE',
    externalId: null
  })

  await dataSeedingClient.locations.upsert({
    id: locationId,
    administrativeAreaId: null,
    name: 'Location with external id',
    validUntil: null,
    locationType: 'CRVS_OFFICE',
    externalId: 'pcode123'
  })

  const locations = await dataSeedingClient.locations.list()
  const updated = locations.find((l) => l.id === locationId)

  expect(updated?.externalId).toBe('pcode123')
  expect(updated?.name).toBe('Location with external id')
})
