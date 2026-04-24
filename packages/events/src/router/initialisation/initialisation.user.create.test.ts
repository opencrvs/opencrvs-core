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
import { generateUuid, Location, TokenUserType } from '@opencrvs/commons'
import {
  createInitialisationTestClient,
  createTestToken,
  setupTestCase,
  systemInitialisationTestSetup,
  TEST_USER_DEFAULT_SCOPES,
  createInitialisationToken
} from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

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
    userId: 'test-system',
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

  const internalToken = createInitialisationToken({
    subject: 'invalid-subject'
  })

  const client = createInitialisationTestClient(internalToken)

  await expect(client.locations.set(locationPayload)).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('Allows user creation when with the right token', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()
  const eventsDb = getClient()

  await client.locations.set(locationPayload)
  const location = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .executeTakeFirstOrThrow()

  const username = 'testuser123'
  const userPayload = {
    email: 'testing+123@opencrvs.org',
    role: 'admin',
    name: [
      {
        use: 'en',
        family: 'family',
        given: ['given']
      }
    ],
    primaryOfficeId: location.id,
    username
  }

  await expect(client.users.create(userPayload)).resolves.toMatchObject({
    administrativeAreaId: undefined,
    primaryOfficeId: location.id,
    role: userPayload.role,
    email: userPayload.email,
    name: userPayload.name,
    type: 'user'
  })

  const createdUserCredentials = await eventsDb
    .selectFrom('userCredentials')
    .selectAll()
    .where('username', '=', username)
    .executeTakeFirstOrThrow()

  const createdUser = await eventsDb
    .selectFrom('users')
    .selectAll()
    .where('id', '=', createdUserCredentials.userId)
    .executeTakeFirstOrThrow()

  expect(createdUser).toMatchObject({
    email: userPayload.email,
    firstname: userPayload.name[0].given[0],
    surname: userPayload.name[0].family,
    officeId: userPayload.primaryOfficeId,
    role: userPayload.role,
    status: 'pending'
  })

  const auditLogs = await eventsDb.selectFrom('auditLog').selectAll().execute()

  expect(auditLogs).toHaveLength(1)

  expect(auditLogs[0]).toMatchObject({
    operation: 'user.create_user',
    clientId: 'opencrvs:data-seeder-service',
    clientType: 'system'
  })
})

test('Throws error when creating user with existing email', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()
  const eventsDb = getClient()

  await client.locations.set(locationPayload)
  const location = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .executeTakeFirstOrThrow()

  const email = 'testing+123@opencrvs.org'
  const userPayload1 = {
    email,
    role: 'admin',
    name: [
      {
        use: 'en',
        family: 'family1',
        given: ['given1']
      }
    ],
    primaryOfficeId: location.id
  }

  const userPayload2 = {
    email,
    role: 'admin2',
    name: [
      {
        use: 'en',
        family: 'family2',
        given: ['given2']
      }
    ],
    primaryOfficeId: location.id
  }

  await expect(client.users.create(userPayload1)).resolves.toBeDefined()
  await expect(client.users.create(userPayload2)).rejects.toThrowError(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
  )
})

test('Throws error when creating user with existing mobile', async () => {
  await systemInitialisationTestSetup()

  const client = createInitialisationTestClient()
  const eventsDb = getClient()

  await client.locations.set(locationPayload)
  const location = await eventsDb
    .selectFrom('locations')
    .selectAll()
    .executeTakeFirstOrThrow()

  const mobile = '+345345343'
  const userPayload1 = {
    email: 'testing+1@opencrvs.org',
    mobile,
    role: 'admin',
    name: [
      {
        use: 'en',
        family: 'family1',
        given: ['given1']
      }
    ],
    primaryOfficeId: location.id
  }

  const userPayload2 = {
    email: 'testing+2@opencrvs.org',
    mobile,
    role: 'admin2',
    name: [
      {
        use: 'en',
        family: 'family2',
        given: ['given2']
      }
    ],
    primaryOfficeId: location.id
  }

  await expect(client.users.create(userPayload1)).resolves.toBeDefined()
  await expect(client.users.create(userPayload2)).rejects.toThrowError(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_MOBILE' })
  )
})
