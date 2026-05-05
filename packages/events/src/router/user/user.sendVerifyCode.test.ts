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
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

describe('user.sendVerifyCode', () => {
  test('returns a nonce when sending verify code for change-phone-number', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })

    expect(result).toHaveProperty('nonce')
    expect(typeof result.nonce).toBe('string')
    expect(result.nonce.length).toBeGreaterThan(0)
  })

  test('returns a nonce when sending verify code for change-email-address', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result = await client.user.sendVerifyCode({
      notificationEvent: 'change-email-address'
    })

    expect(result).toHaveProperty('nonce')
    expect(typeof result.nonce).toBe('string')
    expect(result.nonce.length).toBeGreaterThan(0)
  })

  test('returns different nonces on subsequent calls', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result1 = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })

    const result2 = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })

    expect(result1.nonce).not.toBe(result2.nonce)
  })

  test('system client cannot call sendVerifyCode', async () => {
    const systemId = getUUID()
    const client = createSystemTestClient(systemId)

    await expect(
      client.user.sendVerifyCode({
        notificationEvent: 'change-phone-number'
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('nonce is a valid base64 string of expected length', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })

    // 16 random bytes in base64 always yields 24 characters (22 data + 2 padding)
    expect(result.nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/)
  })

  test('different users receive different nonces', async () => {
    const { user: user1 } = await setupTestCase()
    const { user: user2 } = await setupTestCase()
    const client1 = createTestClient(user1)
    const client2 = createTestClient(user2)

    const result1 = await client1.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })
    const result2 = await client2.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })

    expect(result1.nonce).not.toBe(result2.nonce)
  })

  test('different notification events for the same user return different nonces', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const phoneResult = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number'
    })
    const emailResult = await client.user.sendVerifyCode({
      notificationEvent: 'change-email-address'
    })

    expect(phoneResult.nonce).not.toBe(emailResult.nonce)
  })
})
