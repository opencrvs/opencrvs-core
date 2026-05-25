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
  encodeScope,
  generateUuid,
  getUUID,
  TestUserRole,
  TokenUserType
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { updateUserById } from '@events/storage/postgres/events/users'

const withReadAll = [encodeScope({ type: 'user.read' })]

test('Throws error if user not found with id', async () => {
  const { user } = await setupTestCase()
  const uuid = getUUID()
  const client = createTestClient(user, withReadAll)
  await expect(client.user.get(uuid)).rejects.toThrowError(
    new TRPCError({ code: 'NOT_FOUND', message: `User not found: ${uuid}` })
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

test('Throws FORBIDDEN if user does not have required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.user.get(getUUID())).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test('Throws NOT_FOUND when accessing user in different office with location scope', async () => {
  const { user, seed, locations } = await setupTestCase()

  const differentOffice = locations.find((l) => l.id !== user.primaryOfficeId)
  if (!differentOffice) {
    throw new Error('No office found outside the user primary office')
  }

  const userInDifferentOffice = await seed.user({
    name: { firstname: 'Bob', surname: 'Jones' },
    primaryOfficeId: differentOffice.id,
    role: TestUserRole.enum.FIELD_AGENT
  })

  const client = createTestClient(user, [
    encodeScope({ type: 'user.read', options: { accessLevel: 'location' } })
  ])

  await expect(client.user.get(userInDifferentOffice.id)).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('Throws NOT_FOUND when accessing user outside jurisdiction with administrativeArea scope', async () => {
  const { user, seed, locations } = await setupTestCase()

  const outsideArea = locations.find(
    (l) => l.administrativeAreaId !== user.administrativeAreaId
  )
  if (!outsideArea) {
    throw new Error('No location found outside the user administrative area')
  }

  const userOutsideJurisdiction = await seed.user({
    name: { firstname: 'Alice', surname: 'Smith' },
    primaryOfficeId: outsideArea.id,
    role: TestUserRole.enum.FIELD_AGENT
  })

  const client = createTestClient(user, [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  await expect(
    client.user.get(userOutsideJurisdiction.id)
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('Returns user outside of jurisdiction with global scope', async () => {
  const { user, seed, locations } = await setupTestCase()

  const differentOffice = locations.find((l) => l.id !== user.primaryOfficeId)
  if (!differentOffice) {
    throw new Error('No office found outside the user primary office')
  }

  const userInDifferentOffice = await seed.user({
    name: { firstname: 'Jane', surname: 'Doe' },
    primaryOfficeId: differentOffice.id,
    role: TestUserRole.enum.FIELD_AGENT
  })

  const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

  await expect(
    client.user.get(userInDifferentOffice.id)
  ).resolves.toMatchObject({ id: userInDifferentOffice.id })
})

test('Returns user in nested location with administrativeArea scope', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'user.read',
      options: { accessLevel: 'administrativeArea' }
    })
  ])

  const rng = createPrng(44444)
  const childAdministrativeAreaId = generateUuid(rng)
  const grandchildLocationId = generateUuid(rng)

  await seed.administrativeAreas([
    {
      name: 'Child area',
      parentId: user.administrativeAreaId,
      id: childAdministrativeAreaId,
      validUntil: null,
      externalId: 'abc123xyz462'
    }
  ])

  await seed.locations([
    {
      name: 'Grandchild office',
      administrativeAreaId: childAdministrativeAreaId,
      locationType: 'CRVS_OFFICE',
      id: grandchildLocationId,
      validUntil: null,
      externalId: 'abc123xyz463'
    }
  ])

  const userInNestedLocation = await seed.user({
    name: {
      firstname: 'John',
      surname: 'Smith'
    },
    primaryOfficeId: grandchildLocationId,
    role: TestUserRole.enum.FIELD_AGENT
  })

  await expect(client.user.get(userInNestedLocation.id)).resolves.toMatchObject(
    { id: userInNestedLocation.id }
  )
})

test('Returns oneself without scopes', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.user.get(user.id)).resolves.toMatchObject({ id: user.id })
})
