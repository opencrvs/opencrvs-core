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
import { getClient } from '@events/storage/postgres/events'
import { createSystemClient } from '@events/storage/postgres/events/system-clients'
import {
  createInternalServiceToken,
  createInternalTestClient,
  createTestToken,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'

const caller = createInternalTestClient()

const auditRecordPayload = {
  clientId: getUUID(),
  entry: {
    operation: 'user.logged_in' as const,
    requestData: { subjectId: getUUID() }
  }
}

test('Returns 403 when accessed with user app token', async () => {
  const { user } = await setupTestCase()

  const appToken = createTestToken({
    userId: user.id,
    scopes: TEST_USER_DEFAULT_SCOPES,
    userType: TokenUserType.enum.user
  })
  const client = createInternalTestClient(appToken)

  await expect(
    client.user.audit.record(auditRecordPayload)
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
    client.user.audit.record(auditRecordPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('Returns 403 when accessed with internal token using invalid subject', async () => {
  const internalToken = createInternalServiceToken({
    subject: 'invalid-subject'
  })

  const client = createInternalTestClient(internalToken)

  await expect(
    client.user.audit.record(auditRecordPayload)
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('derives clientType system from a system client id', async () => {
  const { user } = await setupTestCase()
  const subjectId = getUUID()
  const systemId = getUUID()
  await createSystemClient({
    id: systemId,
    name: 'Test System Client',
    createdBy: user.id,
    secretHash: 'hash',
    salt: 'salt',
    shaSecret: 'shaSecret'
  })

  await caller.user.audit.record({
    clientId: systemId,
    entry: {
      operation: 'user.deactivate',
      requestData: {
        subjectId,
        reason: 'suspicious activity'
      }
    }
  })

  const db = getClient()
  const logs = await db
    .selectFrom('auditLog')
    .selectAll()
    .where('clientId', '=', systemId)
    .execute()

  expect(logs).toHaveLength(1)
  expect(logs[0].operation).toBe('user.deactivate')
  expect(logs[0].clientType).toBe(TokenUserType.enum.system)
  expect(logs[0].requestData).toEqual({
    subjectId,
    reason: 'suspicious activity'
  })
})

test('derives clientType user from a user id', async () => {
  const { user } = await setupTestCase()
  const subjectId = getUUID()

  await caller.user.audit.record({
    clientId: user.id,
    entry: {
      operation: 'user.reactivate',
      requestData: {
        subjectId,
        reason: 'reinstated after review'
      }
    }
  })

  const db = getClient()
  const logs = await db
    .selectFrom('auditLog')
    .selectAll()
    .where('clientId', '=', user.id)
    .execute()

  expect(logs).toHaveLength(1)
  expect(logs[0].operation).toBe('user.reactivate')
  expect(logs[0].clientType).toBe(TokenUserType.enum.user)
  expect(logs[0].requestData).toEqual({
    subjectId,
    reason: 'reinstated after review'
  })
})

test('refuses to attribute an entry to a client that does not exist', async () => {
  const { user } = await setupTestCase()

  await expect(
    caller.user.audit.record({
      clientId: getUUID(),
      entry: {
        operation: 'user.logged_in',
        requestData: { subjectId: user.id }
      }
    })
  ).rejects.toMatchObject({ code: 'BAD_REQUEST' })

  const db = getClient()
  const logs = await db.selectFrom('auditLog').selectAll().execute()
  expect(logs).toHaveLength(0)
})

test('stores responseSummary as null', async () => {
  const { user } = await setupTestCase()

  await caller.user.audit.record({
    clientId: user.id,
    entry: {
      operation: 'user.logged_in',
      requestData: { subjectId: user.id }
    }
  })

  const db = getClient()
  const [log] = await db
    .selectFrom('auditLog')
    .selectAll()
    .where('clientId', '=', user.id)
    .execute()

  expect(log.responseSummary).toBeNull()
})
