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
  getUUID,
  TestUserRole,
  TokenUserType
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { updateUserById } from '@events/storage/postgres/events/users'

const withReadAll = [encodeScope({ type: 'user.read' })]

test('Throws error if user does not have required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.user.get(user.id)).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Throws error if user not found with id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)
  await expect(client.user.get(getUUID())).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Returns user in correct format if found', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, withReadAll)
  const fetchedUser = await client.user.get(user.id)

  expect(fetchedUser).toEqual(
    expect.objectContaining({
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
      primaryOfficeId: user.primaryOfficeId,
      type: TokenUserType.enum.user
    })
  )
})

test('Returns user with full honorific name when defined', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, withReadAll)
  await updateUserById(user.id, {
    fullHonorificName: 'Dr. John Doe, PhD'
  })
  const fetchedUser = await client.user.get(user.id)
  expect(fetchedUser).toEqual(
    expect.objectContaining({
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
      primaryOfficeId: user.primaryOfficeId,
      fullHonorificName: 'Dr. John Doe, PhD',
      type: TokenUserType.enum.user
    })
  )
})

test('Returns user with global scope regardless of office', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({ type: 'user.read' })
  ])

  const fetched = await client.user.get(users[1].id)
  expect(fetched).toMatchObject({ id: users[1].id })
})

test('Returns user in same office with location scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  const fetched = await client.user.get(user.id)
  expect(fetched).toMatchObject({ id: user.id })
})

test('Throws NOT_FOUND for user in different office with location scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  await expect(client.user.get(users[1].id)).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Throws NOT_FOUND for user outside jurisdiction with administrativeArea scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  await expect(client.user.get(users[1].id)).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Returns user in nested location with administrativeArea scope', async () => {
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
      externalId: 'abc123xyz460'
    }
  ])

  const userInChildLocation = await seed.user({
    name: [{ family: 'Smith', given: ['John'], use: 'en' }],
    primaryOfficeId: childLocationId,
    role: TestUserRole.enum.FIELD_AGENT
  })

  const fetched = await client.user.get(userInChildLocation.id)
  expect(fetched).toMatchObject({ id: userInChildLocation.id })
})
