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
import { createInternalTestClient, setupTestCase } from '@events/tests/utils'
import { generateHash, generateSaltedHash } from '@events/service/auth/hash'

const caller = createInternalTestClient()

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
