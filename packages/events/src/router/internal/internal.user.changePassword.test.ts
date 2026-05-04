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
import { getUUID, TokenUserType } from '@opencrvs/commons'
import {
  createInternalServiceToken,
  createInternalTestClient,
  createTestToken,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { generateHash, generateSaltedHash } from '@events/service/auth/hash'

const caller = createInternalTestClient()

test('Returns 403 when accessed with user app token', async () => {
  const { user } = await setupTestCase()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInternalTestClient(appToken)

  await expect(
    client.user.changePassword({ userId: user.id, password: 'newpassword' })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with system app token', async () => {
  const appToken = createTestToken({
    userId: TEST_SYSTEM_ID,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.system
  })

  const client = createInternalTestClient(appToken)

  await expect(
    client.user.changePassword({ userId: getUUID(), password: 'newpassword' })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })

  const client = createInternalTestClient(internalToken)

  await expect(
    client.user.changePassword({ userId: getUUID(), password: 'newpassword' })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 200 when accessed with proper internal token', async () => {
  const { user, eventsDb } = await setupTestCase()
  const { hash, salt } = await generateSaltedHash('oldpassword')

  await eventsDb
    .updateTable('userCredentials')
    .set({ passwordHash: hash, salt })
    .where('userId', '=', user.id)
    .execute()

  const token = createInternalServiceToken()
  const client = createInternalTestClient(token)

  await expect(
    client.user.changePassword({ userId: user.id, password: 'newpassword' })
  ).resolves.toBeUndefined()
})

test('returns UNAUTHORIZED when user not found', async () => {
  await expect(
    caller.user.changePassword({
      userId: getUUID(),
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('updates the password hash for a valid user', async () => {
  const { eventsDb, user } = await setupTestCase()
  const { hash: initialHash, salt } = await generateSaltedHash('oldpassword')

  await eventsDb
    .updateTable('userCredentials')
    .set({ passwordHash: initialHash, salt })
    .where('userId', '=', user.id)
    .execute()

  await caller.user.changePassword({
    userId: user.id,
    password: 'newpassword'
  })

  const updated = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', user.id)
    .executeTakeFirstOrThrow()

  const expectedHash = await generateHash('newpassword', updated.salt)
  expect(updated.passwordHash).toBe(expectedHash)
  expect(updated.salt).toBe(salt)
})

test('returns UNAUTHORIZED when user is not active', async () => {
  const { eventsDb, user } = await setupTestCase()

  await eventsDb
    .updateTable('users')
    .set({ status: 'deactivated' })
    .where('id', '=', user.id)
    .execute()

  await expect(
    caller.user.changePassword({
      userId: user.id,
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})
