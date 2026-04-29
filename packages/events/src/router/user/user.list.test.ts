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
  encodeScope,
  generateUuid,
  TestUserRole,
  TokenUserType
} from '@opencrvs/commons'
import {
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase
} from '@events/tests/utils'
import { createSystemClient } from '@events/storage/postgres/events/system-clients'

const withReadAll = [encodeScope({ type: 'user.read' })]

test('Throws NOT_FOUND if user does not have user.read scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.user.list([user.id])).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Returns empty list when no ids provided', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const fetchedEvents = await client.user.list([])

  expect(fetchedEvents).toEqual([])
})

test('Returns empty list when no ids match', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const fetchedEvents = await client.user.list(['123-123-123'])

  expect(fetchedEvents).toEqual([])
})

test('Returns user in correct format', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const fetchedUser = await client.user.list([user.id])

  expect(fetchedUser).toEqual([
    expect.objectContaining({
      id: user.id,
      name: user.name,
      role: user.role,
      primaryOfficeId: user.primaryOfficeId,
      type: TokenUserType.enum.user,
      status: user.status
    })
  ])
})

test('Returns both normal users and system users', async () => {
  const { user, generator, locations, seed } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const usersToCreate = locations.map((location) =>
    generator.user.create({ primaryOfficeId: location.id })
  )

  const userIds = []
  const users: Array<Awaited<ReturnType<typeof seed.user>>> = []

  for (const userToCreate of usersToCreate) {
    const createdUser = await seed.user(userToCreate)
    const userId = createdUser.id
    userIds.push(userId)
    users.push(createdUser)
  }

  const systemUserId = '67bda93bfc07dee78ae55114'

  await createSystemClient({
    name: 'My health system integration',
    legacyId: systemUserId,
    createdBy: user.id,
    salt: 'RANDOM_STRING',
    secretHash: 'RANDOM_STRING',
    shaSecret: 'RANDOM_STRING'
  })

  const fetchedUsers = await client.user.list([...userIds, systemUserId])

  expect(sanitizeForSnapshot(fetchedUsers, ['id', 'email'])).toMatchSnapshot()
})

test('Does not return users or systems which are not found', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const fetchedUser = await client.user.list([user.id, '123-123-123', 'foobar'])

  expect(fetchedUser).toEqual([
    expect.objectContaining({
      id: user.id,
      name: user.name,
      role: user.role,
      primaryOfficeId: user.primaryOfficeId,
      type: TokenUserType.enum.user,
      fullHonorificName: user.fullHonorificName
    })
  ])
})

test('Returns multiple users', async () => {
  const { user, generator, locations, seed } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const usersToCreate = locations.map((location) =>
    generator.user.create({ primaryOfficeId: location.id })
  )

  const userIds = []
  for (const userToCreate of usersToCreate) {
    const createdUser = await seed.user(userToCreate)
    userIds.push(createdUser.id)
  }

  const fetchedUsers = await client.user.list(userIds)

  expect(fetchedUsers).toHaveLength(locations.length)
})

test('Returns multiple users with honorifics', async () => {
  const { user, generator, locations, seed } = await setupTestCase()
  const client = createTestClient(user, withReadAll)

  const usersToCreate = locations.map((location, i) =>
    generator.user.create({
      primaryOfficeId: location.id,
      // 4 to make the nth work.
      fullHonorificName: `${i + 4}th Class Registration Officer, John Doe`
    })
  )

  const userIds = []
  for (const userToCreate of usersToCreate) {
    const createdUser = await seed.user(userToCreate)
    userIds.push(createdUser.id)
  }

  const fetchedUsers = await client.user.list(userIds)

  expect(fetchedUsers).toHaveLength(locations.length)
  expect(sanitizeForSnapshot(fetchedUsers, ['id', 'email'])).toMatchSnapshot()
})

test('Filters out users from different office with location scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  const result = await client.user.list([users[0].id, users[1].id])

  expect(result.map((u) => u.id)).toContain(users[0].id)
  expect(result.map((u) => u.id)).not.toContain(users[1].id)
})

test('Returns users from same office with location scope', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  const sameOfficeUser = await seed.user({
    name: [{ family: 'Jones', given: ['Alice'], use: 'en' }],
    primaryOfficeId: user.primaryOfficeId,
    role: TestUserRole.enum.FIELD_AGENT
  })

  const result = await client.user.list([user.id, sameOfficeUser.id])

  expect(result).toHaveLength(2)
})

test('System users always pass through regardless of jurisdiction scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  const systemUserId = '67bda93bfc07dee78ae55115'
  await createSystemClient({
    name: 'Test system',
    legacyId: systemUserId,
    createdBy: user.id,
    salt: 'RANDOM_STRING',
    secretHash: 'RANDOM_STRING',
    shaSecret: 'RANDOM_STRING'
  })

  const result = await client.user.list([systemUserId])

  expect(result).toHaveLength(1)
  expect(result[0].type).toBe(TokenUserType.enum.system)
})

test('Filters out users outside jurisdiction with administrativeArea scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  const result = await client.user.list([users[0].id, users[1].id])

  expect(result.map((u) => u.id)).toContain(users[0].id)
  expect(result.map((u) => u.id)).not.toContain(users[1].id)
})

test('Returns users in nested locations with administrativeArea scope', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  const childLocationId = generateUuid()
  await seed.locations([
    {
      name: 'Child office',
      administrativeAreaId: user.administrativeAreaId,
      locationType: 'CRVS_OFFICE',
      id: childLocationId,
      validUntil: null,
      externalId: 'abc123xyz461'
    }
  ])

  const userInChildLocation = await seed.user({
    name: [{ family: 'Doe', given: ['Jane'], use: 'en' }],
    primaryOfficeId: childLocationId,
    role: TestUserRole.enum.FIELD_AGENT
  })

  const result = await client.user.list([userInChildLocation.id])

  expect(result.map((u) => u.id)).toContain(userInChildLocation.id)
})
