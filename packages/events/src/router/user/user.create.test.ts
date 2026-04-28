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
import { encodeScope } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getClient } from '@events/storage/postgres/events'

test('Throws error when user does not have the right scope', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user)

  await expect(
    client.user.create({
      email: 'testing+123@opencrvs.org',
      role: 'admin',

      name: [
        {
          use: 'en',
          family: 'family',
          given: ['given']
        }
      ],
      primaryOfficeId: user.primaryOfficeId
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Allows user creation when with the right scope', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [
    encodeScope({
      type: 'user.create'
    })
  ])

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
    primaryOfficeId: user.primaryOfficeId
  }

  const response = await client.user.create(userPayload)

  expect(response).toMatchObject({
    administrativeAreaId: user.administrativeAreaId,
    primaryOfficeId: user.primaryOfficeId,
    role: userPayload.role,
    email: userPayload.email,
    name: userPayload.name,
    type: 'user'
  })

  const eventsDb = getClient()

  const createdUserCredentials = await eventsDb
    .selectFrom('userCredentials')
    .selectAll()
    .where('userCredentials.userId', '=', response.id)
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
    clientId: user.id,
    clientType: 'user'
  })
})

test('Throws error when creating user with existing email', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [
    encodeScope({
      type: 'user.create'
    })
  ])

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
    primaryOfficeId: user.primaryOfficeId
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
    primaryOfficeId: user.primaryOfficeId
  }

  await expect(client.user.create(userPayload1)).resolves.toBeDefined()
  await expect(client.user.create(userPayload2)).rejects.toThrowError(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
  )
})

test('Persists custom data field when provided', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [encodeScope({ type: 'user.create' })])

  const customData = { registrationNumber: 'REG-001', department: 'civil' }

  const created = await client.user.create({
    email: 'testing+data@opencrvs.org',
    role: 'admin',
    name: [{ use: 'en', family: 'family', given: ['given'] }],
    primaryOfficeId: user.primaryOfficeId,
    data: customData
  })

  expect(created.data).toMatchObject(customData)
})

test('Rejects when username is provided by app caller', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [encodeScope({ type: 'user.create' })])

  await expect(
    client.user.create({
      email: 'testing+username@opencrvs.org',
      role: 'admin',
      name: [{ use: 'en', family: 'family', given: ['given'] }],
      primaryOfficeId: user.primaryOfficeId,
      username: 'custom-username'
    } as any)
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
})

test.fails('Rejects password when provided by app caller', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [encodeScope({ type: 'user.create' })])

  await expect(
    client.user.create({
      email: 'testing+password@opencrvs.org',
      role: 'admin',
      name: [{ use: 'en', family: 'family', given: ['given'] }],
      primaryOfficeId: user.primaryOfficeId,
      password: 'passWORD123456'
    } as any)
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
})

test('Auto-generates username from name', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [encodeScope({ type: 'user.create' })])

  const created = await client.user.create({
    email: 'testing+autogen@opencrvs.org',
    role: 'admin',
    name: [{ use: 'en', family: 'Smith', given: ['Jane'] }],
    primaryOfficeId: user.primaryOfficeId
  })

  const eventsDb = getClient()
  const credentials = await eventsDb
    .selectFrom('userCredentials')
    .selectAll()
    .where('userId', '=', created.id)
    .executeTakeFirstOrThrow()

  expect(credentials.username).toMatch(/^j\.smith/)
})

test('Throws error when creating user with existing mobile', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [
    encodeScope({
      type: 'user.create'
    })
  ])

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
    primaryOfficeId: user.primaryOfficeId
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
    primaryOfficeId: user.primaryOfficeId
  }

  await expect(client.user.create(userPayload1)).resolves.toBeDefined()
  await expect(client.user.create(userPayload2)).rejects.toThrowError(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_MOBILE' })
  )
})
