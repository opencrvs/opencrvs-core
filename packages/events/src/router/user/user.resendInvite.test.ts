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
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('resendInvite generates new password and updates status to pending', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  // Set initial user status to active
  await eventsDb
    .updateTable('users')
    .set({ status: 'active' })
    .where('id', '=', targetUser.id)
    .execute()

  // Get initial credentials
  const initialCreds = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  // Call resendInvite
  await client.user.resendInvite(targetUser.id)

  // Verify user status changed to pending
  const updatedUser = await eventsDb
    .selectFrom('users')
    .select(['status'])
    .where('id', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  expect(updatedUser.status).toBe('pending')

  // Verify password hash was updated
  const updatedCreds = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  expect(updatedCreds.passwordHash).not.toBe(initialCreds.passwordHash)
  // Salt should be updated as well (new salt generated with password)
  expect(updatedCreds.salt).not.toBe(initialCreds.salt)
})

test('resendInvite requires user.edit scope', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  // Create a client with insufficient scopes
  const limitedClient = createTestClient(user, [])

  await expect(
    limitedClient.user.resendInvite(targetUser.id)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('resendInvite generates fresh credentials on each call', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  // Call resendInvite multiple times to ensure new password each time
  await client.user.resendInvite(targetUser.id)

  const creds1 = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  // Call again
  await client.user.resendInvite(targetUser.id)

  const creds2 = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', targetUser.id)
    .executeTakeFirstOrThrow()

  // Each call should generate different password/salt
  expect(creds2.passwordHash).not.toBe(creds1.passwordHash)
  expect(creds2.salt).not.toBe(creds1.salt)
})

test('resendInvite writes audit log', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

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
