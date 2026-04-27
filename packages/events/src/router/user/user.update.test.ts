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
import { updateUserById } from '@events/storage/postgres/events/users'

const USER_EDIT_SCOPE = encodeScope({ type: 'user.edit' })
const CONFIG_UPDATE_ALL_SCOPE = encodeScope({ type: 'config.update-all' })

function makeUpdateInput(user: {
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

  await expect(client.user.update(makeUpdateInput(user))).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test('throws FORBIDDEN when trying to change primaryOfficeId without config.update-all scope', async () => {
  const { user, locations } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])
  const otherOfficeId = locations[1].id

  await expect(
    client.user.update({
      ...makeUpdateInput(user),
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
    ...makeUpdateInput(user),
    primaryOfficeId: otherOfficeId
  })

  expect(updatedUser.primaryOfficeId).toBe(otherOfficeId)
})

test('throws CONFLICT with DUPLICATE_PHONE if mobile is already in use by another user', async () => {
  const { user, users } = await setupTestCase()
  const [, secondUser] = users

  await updateUserById(secondUser.id, { mobile: '+254700000001' })

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...makeUpdateInput(user),
      mobile: '+254700000001'
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
      ...makeUpdateInput(user),
      email: duplicateEmail
    })
  ).rejects.toMatchObject(
    new TRPCError({ code: 'CONFLICT', message: 'DUPLICATE_EMAIL' })
  )
})

test("allows update when mobile is the same user's own mobile", async () => {
  const { user } = await setupTestCase()
  await updateUserById(user.id, { mobile: '+254700000002' })

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.update({
      ...makeUpdateInput(user),
      mobile: '+254700000002'
    })
  ).resolves.not.toThrow()
})

test("allows update when email is the same user's own email", async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(client.user.update(makeUpdateInput(user))).resolves.not.toThrow()
})

test('successfully updates user fields and returns updated user', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [USER_EDIT_SCOPE])

  const updatedUser = await client.user.update({
    ...makeUpdateInput(user),
    name: [{ use: 'en', given: ['Jane'], family: 'Smith' }],
    email: `updated-${user.id}@test.example`,
    mobile: '+254700000099'
  })

  expect(updatedUser).toMatchObject({
    id: user.id,
    name: [{ use: 'en', given: ['Jane'], family: 'Smith' }],
    email: `updated-${user.id}@test.example`,
    mobile: '+254700000099',
    primaryOfficeId: user.primaryOfficeId
  })
})
