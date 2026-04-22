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

  await expect(client.initialisation.locations.list()).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with system app token', async () => {
  const systemToken = createTestToken({
    userId: 'test-system',
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  await systemInitialisationTestSetup()

  const client = createInternalTestClient(systemToken)

  await expect(client.initialisation.locations.list()).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })
  await systemInitialisationTestSetup()

  const client = createInternalTestClient(internalToken)

  await expect(client.initialisation.locations.list()).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Returns single location in right format', async () => {
  const client = createInternalTestClient()

  const initialLocations = await client.initialisation.locations.list()

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

  await client.initialisation.locations.set(setLocationPayload)

  const locations = await client.initialisation.locations.list()

  expect(locations).toHaveLength(initialLocations.length + 1)
  expect(locations).toMatchObject(initialLocations.concat(setLocationPayload))
})

test('Returns multiple locations', async () => {
  const client = createInternalTestClient()

  const locationRng = createPrng(8451323)
  const generator = payloadGenerator(locationRng)
  await client.initialisation.locations.set(
    generator.locations.set(5, locationRng)
  )

  const locations = await client.initialisation.locations.list()

  expect(locations).toHaveLength(5)
})
