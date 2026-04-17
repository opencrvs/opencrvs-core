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
import { getUUID } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { generateHash, generateSaltedHash } from '@events/service/auth/hash'

test('returns UNAUTHORIZED when user not found', async () => {
  const userId = getUUID()
  const client = createTestClient({
    id: userId,
    role: 'REGISTRATION_AGENT',
    primaryOfficeId: getUUID(),
    name: []
  })
  await expect(
    client.user.changePassword({
      userId: userId,
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('updates the password hash without existingPassword (reset flow)', async () => {
  const { eventsDb, user } = await setupTestCase()
  const client = createTestClient(user)
  const { hash: initialHash, salt } = await generateSaltedHash('oldpassword')

  await eventsDb
    .updateTable('userCredentials')
    .set({ passwordHash: initialHash, salt })
    .where('userId', '=', user.id)
    .execute()

  await client.user.changePassword({ userId: user.id, password: 'newpassword' })

  const updated = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', user.id)
    .executeTakeFirstOrThrow()

  const expectedHash = await generateHash('newpassword', updated.salt)
  expect(updated.passwordHash).toBe(expectedHash)
  // Salt must not change
  expect(updated.salt).toBe(salt)
})

test('updates the password when existingPassword matches (change flow)', async () => {
  const { eventsDb, user } = await setupTestCase()
  const client = createTestClient(user)
  const { hash, salt } = await generateSaltedHash('oldpassword')

  await eventsDb
    .updateTable('userCredentials')
    .set({ passwordHash: hash, salt })
    .where('userId', '=', user.id)
    .execute()

  await client.user.changePassword({
    userId: user.id,
    existingPassword: 'oldpassword',
    password: 'newpassword'
  })

  const updated = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash'])
    .where('userId', '=', user.id)
    .executeTakeFirstOrThrow()

  const expectedHash = await generateHash('newpassword', salt)
  expect(updated.passwordHash).toBe(expectedHash)
})

test('returns UNAUTHORIZED when existingPassword does not match', async () => {
  const { eventsDb, user } = await setupTestCase()
  const client = createTestClient(user)
  const { hash, salt } = await generateSaltedHash('correctpassword')

  await eventsDb
    .updateTable('userCredentials')
    .set({ passwordHash: hash, salt })
    .where('userId', '=', user.id)
    .execute()

  await expect(
    client.user.changePassword({
      userId: user.id,
      existingPassword: 'wrongpassword',
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns UNAUTHORIZED when user is not active and existingPassword is provided', async () => {
  const { eventsDb, user } = await setupTestCase()
  const client = createTestClient(user)
  const { hash, salt } = await generateSaltedHash('password')

  await eventsDb
    .updateTable('users')
    .set({ status: 'deactivated' })
    .where('id', '=', user.id)
    .execute()

  await eventsDb
    .updateTable('userCredentials')
    .set({ passwordHash: hash, salt })
    .where('userId', '=', user.id)
    .execute()

  await expect(
    client.user.changePassword({
      userId: user.id,
      existingPassword: 'password',
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})
