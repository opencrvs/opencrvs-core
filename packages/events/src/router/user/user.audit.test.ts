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
import { encodeScope, TokenUserType } from '@opencrvs/commons'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import { createTestClient, setupTestCase } from '@events/tests/utils'

describe('user.audit.list', () => {
  test('returns empty list when no entries exist for user', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

    const result = await client.user.audit.list({ userId: user.id })

    expect(result.results).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  test('returns recorded entries for a user', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

    await writeAuditLog({
      clientId: user.id,
      clientType: TokenUserType.enum.user,
      operation: 'user.logged_in',
      requestData: { subjectId: user.id }
    })

    const result = await client.user.audit.list({ userId: user.id })

    expect(result.total).toBe(1)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].operation).toBe('user.logged_in')
    expect(result.results[0].requestData).toEqual({ subjectId: user.id })
    expect(result.results[0].clientType).toBe(TokenUserType.enum.user)
  })

  test('paginates results with skip and count', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

    for (let i = 0; i < 5; i++) {
      await writeAuditLog({
        clientId: user.id,
        clientType: TokenUserType.enum.user,
        operation: 'user.logged_in',
        requestData: { subjectId: user.id }
      })
    }

    const firstPage = await client.user.audit.list({
      userId: user.id,
      skip: 0,
      count: 3
    })
    expect(firstPage.results).toHaveLength(3)
    expect(firstPage.total).toBe(5)

    const secondPage = await client.user.audit.list({
      userId: user.id,
      skip: 3,
      count: 3
    })
    expect(secondPage.results).toHaveLength(2)
    expect(secondPage.total).toBe(5)
  })

  test('excludes specified operations from results and count', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

    await writeAuditLog({
      clientId: user.id,
      clientType: TokenUserType.enum.user,
      operation: 'user.logged_in',
      requestData: { subjectId: user.id }
    })
    await writeAuditLog({
      clientId: user.id,
      clientType: TokenUserType.enum.user,
      operation: 'user.logged_out',
      requestData: { subjectId: user.id }
    })
    await writeAuditLog({
      clientId: user.id,
      clientType: TokenUserType.enum.user,
      operation: 'user.logged_in',
      requestData: { subjectId: user.id }
    })

    const result = await client.user.audit.list({
      userId: user.id,
      excludeOperations: ['user.logged_in']
    })

    expect(result.total).toBe(1)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].operation).toBe('user.logged_out')
  })

  test('filters entries by timeStart', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

    await writeAuditLog({
      clientId: user.id,
      clientType: TokenUserType.enum.user,
      operation: 'user.logged_in',
      requestData: { subjectId: user.id }
    })

    const futureDate = new Date(Date.now() + 60_000).toISOString()

    const result = await client.user.audit.list({
      userId: user.id,
      timeStart: futureDate
    })

    expect(result.total).toBe(0)
    expect(result.results).toHaveLength(0)
  })

  test('filters entries by timeEnd', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [encodeScope({ type: 'user.read' })])

    await writeAuditLog({
      clientId: user.id,
      clientType: TokenUserType.enum.user,
      operation: 'user.logged_in',
      requestData: { subjectId: user.id }
    })

    const pastDate = new Date(Date.now() - 60_000).toISOString()

    const result = await client.user.audit.list({
      userId: user.id,
      timeEnd: pastDate
    })

    expect(result.total).toBe(0)
    expect(result.results).toHaveLength(0)
  })

  test('throws NOT_FOUND without user.read or user.read-only-my-audit scope', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.user.audit.list({ userId: user.id })
    ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
  })

  test('user with user.read-only-my-audit can read their own audit log', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [
      encodeScope({ type: 'user.read-only-my-audit' })
    ])

    const result = await client.user.audit.list({ userId: user.id })
    expect(result.total).toBe(0)
    expect(result.results).toHaveLength(0)
  })

  test('user with user.read-only-my-audit cannot read another user audit log', async () => {
    const { users } = await setupTestCase()
    const [userA, userB] = users
    const client = createTestClient(userA, [
      encodeScope({ type: 'user.read-only-my-audit' })
    ])

    await expect(
      client.user.audit.list({ userId: userB.id })
    ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
  })
})
