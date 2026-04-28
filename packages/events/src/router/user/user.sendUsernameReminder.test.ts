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

test('sendUsernameReminder throws NOT_FOUND when user does not exist', async () => {
  const { user } = await setupTestCase()
  const nonExistentUserId = getUUID()

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.sendUsernameReminder(nonExistentUserId)
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('sendUsernameReminder sends notification and records audit log', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await client.user.sendUsernameReminder(targetUser.id)

  const auditEntry = await eventsDb
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'user.username_reminder_by_admin')
    .where(sql`request_data->>'subjectId'`, '=', targetUser.id)
    .executeTakeFirst()

  expect(auditEntry).toBeDefined()
  expect(auditEntry?.operation).toBe('user.username_reminder_by_admin')
})

test('sendUsernameReminder requires user.edit scope', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  const limitedClient = createTestClient(user, [])

  await expect(
    limitedClient.user.sendUsernameReminder(targetUser.id)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('sendUsernameReminder can be called multiple times on the same user', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  // Call twice to ensure idempotency
  await client.user.sendUsernameReminder(targetUser.id)
  await client.user.sendUsernameReminder(targetUser.id)

  const auditEntries = await eventsDb
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'user.username_reminder_by_admin')
    .where(sql`request_data->>'subjectId'`, '=', targetUser.id)
    .execute()

  expect(auditEntries).toHaveLength(2)
})
