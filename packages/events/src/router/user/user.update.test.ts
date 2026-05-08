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
/* eslint-disable max-lines */
import { TRPCError } from '@trpc/server'
import { encodeScope, getUUID, TestUserRole } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { updateUserById } from '@events/storage/postgres/events/users'
import { getClient } from '@events/storage/postgres/events'
import { seeder, setupHierarchyWithUsers } from '@events/tests/generators'

const USER_EDIT_SCOPE = encodeScope({ type: 'user.edit' })
const CONFIG_UPDATE_ALL_SCOPE = encodeScope({ type: 'config.update-all' })

function generateUpdateInput(user: {
  id: string
  primaryOfficeId: string
  role: string
}) {
  return {
    id: user.id,
    email: `user-${user.id}@test.example`,
    role: user.role,
    primaryOfficeId: user.primaryOfficeId
  }
}

test('throws FORBIDDEN when user.edit scope is missing', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.user.update(generateUpdateInput(user))
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('throws FORBIDDEN when trying to change primaryOfficeId without config.update-all scope', async () => {
  const { user, locations } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])
  const otherOfficeId = locations[1].id

  await expect(
    client.user.update({
      ...generateUpdateInput(user),
      primaryOfficeId: otherOfficeId
    })
  ).rejects.toMatchObject({ code: 'FORBIDDEN' })
})

test('allows changing primaryOfficeId when user has config.update-all scope', async () => {
  const { user, locations } = await setupTestCase()
  const client = createTestClient(user, [
    USER_EDIT_SCOPE,
    CONFIG_UPDATE_ALL_SCOPE
  ])
  const otherOfficeId = locations[1].id

  const updatedUser = await client.user.update({
    ...generateUpdateInput(user),
    primaryOfficeId: otherOfficeId
  })

  expect(updatedUser.primaryOfficeId).toBe(otherOfficeId)
})

test('Prevents changing user who is located outside callers jurisdiction', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    CONFIG_UPDATE_ALL_SCOPE,
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'location'
      }
    })
  ])

  const topLevelLocationId = getUUID()
  await seed.locations([
    {
      name: 'top-level-location',
      administrativeAreaId: null,
      id: topLevelLocationId,
      locationType: 'EMBASSY',
      validUntil: null
    }
  ])

  const newUser = await seed.user({
    primaryOfficeId: topLevelLocationId,
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'Test', surname: 'User' }
  })

  await expect(
    client.user.update({
      id: newUser.id,
      signature: {
        originalFilename: 'string',
        path: 'string',
        type: 'string'
      }
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))

  await expect(
    client.user.update({
      id: newUser.id,
      primaryOfficeId: user.primaryOfficeId
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('Allows changing user located under same location to a different one', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    CONFIG_UPDATE_ALL_SCOPE,
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'location'
      }
    })
  ])

  const newUser = await seed.user({
    primaryOfficeId: user.primaryOfficeId,
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'Test', surname: 'User' }
  })

  const topLevelLocationId = getUUID()
  await seed.locations([
    {
      name: 'top-level-location',
      administrativeAreaId: null,
      id: topLevelLocationId,
      locationType: 'EMBASSY',
      validUntil: null
    }
  ])

  await expect(
    client.user.update({
      id: newUser.id,
      primaryOfficeId: topLevelLocationId
    })
  ).resolves.toMatchObject({
    primaryOfficeId: topLevelLocationId
  })
})

test('throws CONFLICT with DUPLICATE_PHONE if mobile is already in use by another user', async () => {
  const { user, users } = await setupTestCase()
  const [, secondUser] = users

  await updateUserById(secondUser.id, { mobile: '01712345678' })

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...generateUpdateInput(user),
      mobile: '01712345678'
    })
  ).rejects.toMatchObject(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_PHONE' })
  )
})

test('throws CONFLICT with DUPLICATE_EMAIL if email is already in use by another user', async () => {
  const { user, users } = await setupTestCase()
  const [, secondUser] = users
  const duplicateEmail = `user-${secondUser.id}@test.example`

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...generateUpdateInput(user),
      email: duplicateEmail
    })
  ).rejects.toMatchObject(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
  )
})

test("allows update when mobile is the same user's own mobile", async () => {
  const { user } = await setupTestCase()
  await updateUserById(user.id, { mobile: '01812345678' })

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...generateUpdateInput(user),
      mobile: '01812345678'
    })
  ).resolves.not.toThrow()
})

test("allows update when email is the same user's own email", async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update(generateUpdateInput(user))
  ).resolves.not.toThrow()
})

test('successfully updates user fields and returns updated user', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  const updatedUser = await client.user.update({
    ...generateUpdateInput(user),
    name: { firstname: 'Jane', surname: 'Smith' },
    email: `updated-${user.id}@test.example`,
    mobile: '01912345678'
  })

  expect(updatedUser).toMatchObject({
    id: user.id,
    name: { firstname: 'Jane', surname: 'Smith' },
    email: `updated-${user.id}@test.example`,
    mobile: '01912345678',
    primaryOfficeId: user.primaryOfficeId
  })
})

test('persists data payload when updating a user', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  const data = { employeeId: 'EMP-002', department: 'Vital Events' }
  const updatedUser = await client.user.update({
    ...generateUpdateInput(user),
    data
  })

  expect(updatedUser.data).toEqual(data)

  const eventsDb = getClient()
  const dbUser = await eventsDb
    .selectFrom('users')
    .selectAll()
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow()

  expect(dbUser.data).toEqual(data)
})

test('preserves existing data when data is omitted from update', async () => {
  const { user } = await setupTestCase()

  // Seed initial data directly into the DB
  const initialData = { employeeId: 'EMP-003' }
  const eventsDb = getClient()
  await eventsDb
    .updateTable('users')
    .set({ data: initialData })
    .where('id', '=', user.id)
    .execute()

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  // Update without supplying data — should leave existing data untouched
  await client.user.update(generateUpdateInput(user))

  const dbUser = await eventsDb
    .selectFrom('users')
    .selectAll()
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow()

  expect(dbUser.data).toEqual(initialData)
})

test('overwrites data when an explicit data object is supplied on update', async () => {
  const { user } = await setupTestCase()

  const eventsDb = getClient()
  await eventsDb
    .updateTable('users')
    .set({ data: { employeeId: 'OLD-001' } })
    .where('id', '=', user.id)
    .execute()

  const client = createTestClient(user, [USER_EDIT_SCOPE])
  const newData = { employeeId: 'NEW-001', region: 'North' }

  const updatedUser = await client.user.update({
    ...generateUpdateInput(user),
    data: newData
  })

  expect(updatedUser.data).toEqual(newData)

  const dbUser = await eventsDb
    .selectFrom('users')
    .selectAll()
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow()

  expect(dbUser.data).toEqual(newData)
})

test('Persists custom data field when updated', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  const customData = { department: 'civil', badge: 'B-42' }

  const updatedUser = await client.user.update({
    id: user.id,
    data: customData
  })

  expect(updatedUser.data).toMatchObject(customData)
})

test('toggling user status keeps other fields intact', async () => {
  const { user, users } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  const userToTestWith = users[1]
  const deactivatedUser = await client.user.update({
    status: 'deactivated',
    id: userToTestWith.id
  })

  expect(deactivatedUser).toMatchObject({
    ...userToTestWith,
    status: 'deactivated'
  })

  const reactivatedUser = await client.user.update({
    status: 'active',
    id: userToTestWith.id
  })

  expect(reactivatedUser).toMatchObject(userToTestWith)
})

test('Updates user when mobile matches PHONE_NUMBER_PATTERN', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...generateUpdateInput(user),
      // matches the test MSW mock pattern: ^01[1-9][0-9]{8}$
      mobile: '01612345678'
    })
  ).resolves.toBeDefined()
})

test('Rejects user update when mobile does not match PHONE_NUMBER_PATTERN', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...generateUpdateInput(user),
      mobile: '12345'
    })
  ).rejects.toThrow(/INVALID_MOBILE/)
})

test('Updates user when no mobile is provided, skipping phone format validation', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update(generateUpdateInput(user))
  ).resolves.toBeDefined()
})

test('Prevents update when changing user\s role to something not in scope', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'user.edit',
      options: {
        role: [TestUserRole.enum.FIELD_AGENT]
      }
    })
  ])

  const newFieldAgent = await seed.user({
    primaryOfficeId: user.primaryOfficeId,
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'Test', surname: 'User' }
  })

  await expect(
    client.user.update({
      id: newFieldAgent.id,
      role: TestUserRole.enum.COMMUNITY_LEADER
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Allows changing user\s role to one within one of the scopes', async () => {
  const { user, seed } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'user.edit',
      options: {
        role: [TestUserRole.enum.FIELD_AGENT]
      }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        role: [
          TestUserRole.enum.FIELD_AGENT,
          TestUserRole.enum.COMMUNITY_LEADER
        ]
      }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        role: [
          TestUserRole.enum.COMMUNITY_LEADER,
          TestUserRole.enum.NATIONAL_REGISTRAR
        ]
      }
    })
  ])

  const newFieldAgent = await seed.user({
    primaryOfficeId: user.primaryOfficeId,
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'Test', surname: 'User' }
  })

  await expect(
    client.user.update({
      id: newFieldAgent.id,
      role: TestUserRole.enum.COMMUNITY_LEADER
    })
  ).resolves.toBeDefined()
})

test("Prevents changing user's role to one not allowed within scope's jurisdiction", async () => {
  // 1. Setup test fixture with a known set of users, administrative areas and locations.
  const { users, locations } = await setupHierarchyWithUsers()
  const seed = seeder()

  const provinceAOffice = locations.find(
    (loc) => loc.name === 'Province A CRVS Office'
  )
  // 1. Create user in province A office.

  if (!provinceAOffice) {
    throw new Error('Test setup failed: ProvinceA Office not found')
  }

  const provinceAUser = users.find(
    (u) => u.primaryOfficeId === provinceAOffice.id
  )

  if (!provinceAUser) {
    throw new Error('Test setup failed: User for ProvinceA Office not found')
  }

  const provinceAFieldAgent = await seed.user({
    primaryOfficeId: provinceAOffice.id,
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'provinceA', surname: 'Field' }
  })

  // 2. Create users with different roles under the same administrative area.
  const villageAOffice = locations.find(
    (loc) => loc.name === 'Village A CRVS Office'
  )

  if (!villageAOffice) {
    throw new Error('Test setup failed: Village A Office not found')
  }

  // 3. Create country level user.
  const countryLevelOffice = locations.find(
    (loc) => loc.name === 'Country-level CRVS Office'
  )

  if (!countryLevelOffice) {
    throw new Error('Test setup failed: Country-Level Office not found')
  }

  const countryLevelUser = await seed.user({
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'Jane', surname: 'Doe' },
    primaryOfficeId: countryLevelOffice.id
  })

  const villageAFieldAgent = await seed.user({
    role: TestUserRole.enum.FIELD_AGENT,
    name: { firstname: 'John', surname: 'Doe' },
    primaryOfficeId: villageAOffice.id
  })

  const villageASocialWorker = await seed.user({
    role: TestUserRole.enum.SOCIAL_WORKER,
    name: { firstname: 'Jonny2', surname: 'Doe' },
    primaryOfficeId: provinceAOffice.id
  })

  const client = createTestClient(provinceAUser, [
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'all',
        role: [TestUserRole.enum.FIELD_AGENT]
      }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'administrativeArea',
        role: [
          TestUserRole.enum.FIELD_AGENT,
          TestUserRole.enum.COMMUNITY_LEADER
        ]
      }
    }),
    encodeScope({
      type: 'user.edit',
      options: {
        accessLevel: 'location',
        role: [
          TestUserRole.enum.FIELD_AGENT,
          TestUserRole.enum.NATIONAL_REGISTRAR
        ]
      }
    })
  ])

  // 4. User at the same location can be changed to roles within all scopes.
  await expect(
    client.user.update({
      id: provinceAFieldAgent.id,
      role: TestUserRole.enum.COMMUNITY_LEADER
    })
  ).resolves.toBeDefined()

  await expect(
    client.user.update({
      id: provinceAFieldAgent.id,
      role: TestUserRole.enum.FIELD_AGENT
    })
  ).resolves.toBeDefined()

  await expect(
    client.user.update({
      id: provinceAFieldAgent.id,
      role: TestUserRole.enum.NATIONAL_REGISTRAR
    })
  ).resolves.toBeDefined()

  // 4. Field agent under the administrative area can be changed to roles within administrative area scopes
  await expect(
    client.user.update({
      id: villageAFieldAgent.id,
      role: TestUserRole.enum.COMMUNITY_LEADER
    })
  ).resolves.toBeDefined()

  await expect(
    client.user.update({
      id: villageAFieldAgent.id,
      role: TestUserRole.enum.FIELD_AGENT
    })
  ).resolves.toBeDefined()

  await expect(
    client.user.update({
      id: villageAFieldAgent.id,
      role: TestUserRole.enum.NATIONAL_REGISTRAR
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))

  // 5. Social worker under the same administrative area can't be changed at all.
  await expect(
    client.user.update({
      id: villageASocialWorker.id,
      role: TestUserRole.enum.COMMUNITY_LEADER
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))

  await expect(
    client.user.update({
      id: villageASocialWorker.id,
      role: TestUserRole.enum.FIELD_AGENT
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))

  await expect(
    client.user.update({
      id: villageASocialWorker.id,
      role: TestUserRole.enum.NATIONAL_REGISTRAR
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))

  // 6. Country level user role can't be changed but other details can be updated.
  await expect(
    client.user.update({
      id: countryLevelUser.id,
      role: TestUserRole.enum.COMMUNITY_LEADER
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))

  await expect(
    client.user.update({
      id: countryLevelUser.id,
      role: TestUserRole.enum.NATIONAL_REGISTRAR
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))

  await expect(
    client.user.update({
      id: countryLevelUser.id,
      role: TestUserRole.enum.FIELD_AGENT
    })
  ).resolves.toBeDefined()
})
