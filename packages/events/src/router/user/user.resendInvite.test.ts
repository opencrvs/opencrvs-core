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
import { sql } from 'kysely'
import { getUUID, encodeScope } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

const USER_EDIT_SCOPE = encodeScope({ type: 'user.edit' })

test('resendInvite throws NOT_FOUND when user does not exist', async () => {
  const { user } = await setupTestCase()
  const nonExistentUserId = getUUID()

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.resendInvite(nonExistentUserId)
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('resendInvite generates new credentials for a pending user', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await eventsDb
    .updateTable('users')
    .set({ status: 'pending' })
    .where('id', '=', targetUser.id)
    .execute()

  const initialCreds = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  await client.user.resendInvite(targetUser.id)

  const updatedUser = await eventsDb
    .selectFrom('users')
    .select(['status'])
    .where('id', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  expect(updatedUser.status).toBe('pending')

  const updatedCreds = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  expect(updatedCreds.passwordHash).not.toBe(initialCreds.passwordHash)
  expect(updatedCreds.salt).not.toBe(initialCreds.salt)
})

test('resendInvite throws BAD_REQUEST when user is not in pending status', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  // users[1] is created with status 'active' by the seeder
  await expect(client.user.resendInvite(targetUser.id)).rejects.toMatchObject({
    code: 'BAD_REQUEST'
  })
})

test('resendInvite requires user.edit scope', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  const limitedClient = createTestClient(user, [])

  await expect(
    limitedClient.user.resendInvite(targetUser.id)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('resendInvite generates fresh credentials on each call', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await eventsDb
    .updateTable('users')
    .set({ status: 'pending' })
    .where('id', '=', targetUser.id)
    .execute()

  await client.user.resendInvite(targetUser.id)

  const creds1 = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  await client.user.resendInvite(targetUser.id)

  const creds2 = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  expect(creds2.passwordHash).not.toBe(creds1.passwordHash)
  expect(creds2.salt).not.toBe(creds1.salt)
})

test('resendInvite writes audit log', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await eventsDb
    .updateTable('users')
    .set({ status: 'pending' })
    .where('id', '=', targetUser.id)
    .execute()

  await client.user.resendInvite(targetUser.id)

  const auditEntry = await eventsDb
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'user.resend_invite')
    .where(sql`request_data->>'subjectId'`, '=', targetUser.id)
    .executeTakeFirst()

  expect(auditEntry).toBeDefined()
  expect(auditEntry?.operation).toBe('user.resend_invite')
})
