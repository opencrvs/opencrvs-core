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
import { http, HttpResponse } from 'msw'
import { sql } from 'kysely'
import { getUUID, encodeScope } from '@opencrvs/commons'
import { UUID } from '@opencrvs/commons/events'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { getUserCredentialsByUserId } from '@events/storage/postgres/events/users'

const USER_EDIT_SCOPE = encodeScope({ type: 'user.edit' })

test('sendResetPasswordInvite throws NOT_FOUND when user does not exist', async () => {
  const { user } = await setupTestCase()
  const nonExistentUserId = getUUID()

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await expect(
    client.user.sendResetPasswordInvite(nonExistentUserId)
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('sendResetPasswordInvite sends notification and records audit log', async () => {
  const { eventsDb, user, users } = await setupTestCase()
  const targetUser = users[1]

  const client = createTestClient(user, [USER_EDIT_SCOPE])

  await client.user.sendResetPasswordInvite(targetUser.id)

  const auditEntry = await eventsDb
    .selectFrom('auditLog')
    .selectAll()
    .where('operation', '=', 'user.password_reset_by_admin')
    .where(sql`request_data->>'subjectId'`, '=', targetUser.id)
    .executeTakeFirst()

  expect(auditEntry).toBeDefined()
  expect(auditEntry?.operation).toBe('user.password_reset_by_admin')
})

test('sendResetPasswordInvite calls triggerUserEventNotification with reset-password-by-admin event', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  let capturedEvent: string | undefined
  let capturedBody: unknown

  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/triggers/user/:event`,
      async ({ request, params }) => {
        capturedEvent = params.event as string
        capturedBody = await request.json()
        return HttpResponse.json({})
      }
    )
  )

  const client = createTestClient(user, [USER_EDIT_SCOPE])
  await client.user.sendResetPasswordInvite(targetUser.id)

  expect(capturedEvent).toBe('reset-password-by-admin')
  expect(capturedBody).toMatchObject({
    temporaryPassword: expect.any(String),
    admin: {
      id: expect.any(String),
      role: expect.any(String)
    }
  })
})

test('sendResetPasswordInvite updates the password hash in the database', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  const credentialsBefore = await getUserCredentialsByUserId(
    targetUser.id as UUID
  )

  const client = createTestClient(user, [USER_EDIT_SCOPE])
  await client.user.sendResetPasswordInvite(targetUser.id)

  const credentialsAfter = await getUserCredentialsByUserId(
    targetUser.id as UUID
  )

  expect(credentialsAfter?.passwordHash).not.toBe(
    credentialsBefore?.passwordHash
  )
  expect(credentialsAfter?.salt).not.toBe(credentialsBefore?.salt)
})

test('sendResetPasswordInvite requires user.edit scope', async () => {
  const { user, users } = await setupTestCase()
  const targetUser = users[1]

  const limitedClient = createTestClient(user, [])

  await expect(
    limitedClient.user.sendResetPasswordInvite(targetUser.id)
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})
