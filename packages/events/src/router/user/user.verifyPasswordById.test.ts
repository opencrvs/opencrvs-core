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
import { UUID } from '@opencrvs/commons/events'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { generateSaltedHash } from '@events/service/auth/hash'
import { updatePasswordHashAndSalt } from '@events/storage/postgres/events/users'

const TEST_PASSWORD = 'correct-horse-battery-staple'

test('verifyPasswordById returns user info when password matches', async () => {
  const { user, users } = await setupTestCase()
  const target = users[1]

  const { hash, salt } = await generateSaltedHash(TEST_PASSWORD)
  await updatePasswordHashAndSalt(target.id as UUID, hash, salt)

  const client = createTestClient(user, [])

  const result = await client.user.verifyPasswordById({
    id: target.id,
    password: TEST_PASSWORD
  })

  expect(result.id).toBe(target.id)
  expect(result.status).toBe('active')
  expect(result.username).toBeDefined()
})

test('verifyPasswordById throws UNAUTHORIZED when password is wrong', async () => {
  const { user, users } = await setupTestCase()
  const target = users[1]

  const { hash, salt } = await generateSaltedHash(TEST_PASSWORD)
  await updatePasswordHashAndSalt(target.id as UUID, hash, salt)

  const client = createTestClient(user, [])

  await expect(
    client.user.verifyPasswordById({
      id: target.id,
      password: 'wrong-password'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('verifyPasswordById throws UNAUTHORIZED when user does not exist', async () => {
  const { user } = await setupTestCase()
  const nonExistentId = getUUID()

  const client = createTestClient(user, [])

  await expect(
    client.user.verifyPasswordById({
      id: nonExistentId,
      password: TEST_PASSWORD
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('verifyPasswordById can be called by the same user verifying their own password', async () => {
  const { user } = await setupTestCase()

  const { hash, salt } = await generateSaltedHash(TEST_PASSWORD)
  await updatePasswordHashAndSalt(user.id as UUID, hash, salt)

  const client = createTestClient(user, [])

  const result = await client.user.verifyPasswordById({
    id: user.id,
    password: TEST_PASSWORD
  })

  expect(result.id).toBe(user.id)
})
