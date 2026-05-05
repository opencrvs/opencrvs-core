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
  createInitialisationTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { payloadGenerator } from '@events/tests/generators'

test('Returns 403 after initialisation is completed', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()
  await expect(client.complete()).resolves.toBeUndefined()

  await expect(client.locations.list()).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with user app token', async () => {
  await systemInitialisationTestSetup()
  const { user } = await setupTestCase()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInitialisationTestClient(appToken)

  await expect(client.locations.list()).rejects.toMatchObject(
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

  await expect(client.locations.list()).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  await systemInitialisationTestSetup()
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })

  const client = createInitialisationTestClient(internalToken)

  await expect(client.locations.list()).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns single location in right format', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const initialLocations = await client.locations.list()

  const setLocationPayload: Location[] = [
    {
      id: generateUuid(),
      administrativeAreaId: null,
      name: 'Location foobar',
      validUntil: null,
      locationType: 'CRVS_OFFICE',
      externalId: 'abc123xyz456'
    }
  ]

  await client.locations.set(setLocationPayload)

  const locations = await client.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject(initialLocations.concat(setLocationPayload))
})

test('Returns multiple locations', async () => {
  await systemInitialisationTestSetup()
  const client = createInitialisationTestClient()

  const locationRng = createPrng(8451323)
  const generator = payloadGenerator(locationRng)
  await client.locations.set(generator.locations.set(5, locationRng))

  const locations = await client.locations.list()

  expect(locations).toHaveLength(5)
})
