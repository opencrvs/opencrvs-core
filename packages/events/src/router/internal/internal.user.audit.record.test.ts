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
  clientType: TokenUserType.enum.user,
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

test('records an audit entry on behalf of a system client', async () => {
  const systemId = getUUID()
  const subjectId = getUUID()

  await caller.user.audit.record({
    clientId: systemId,
    clientType: TokenUserType.enum.system,
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

test('records an audit entry on behalf of a user', async () => {
  const { user } = await setupTestCase()
  const subjectId = getUUID()

  await caller.user.audit.record({
    clientId: user.id,
    clientType: TokenUserType.enum.user,
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

test('stores responseSummary as null', async () => {
  const systemId = getUUID()

  await caller.user.audit.record({
    clientId: systemId,
    clientType: TokenUserType.enum.system,
    entry: {
      operation: 'user.logged_in',
      requestData: { subjectId: getUUID() }
    }
  })

  const db = getClient()
  const [log] = await db
    .selectFrom('auditLog')
    .selectAll()
    .where('clientId', '=', systemId)
    .execute()

  expect(log.responseSummary).toBeNull()
})
