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
import { encodeScope, getUUID } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

const USER_EDIT_SCOPE = encodeScope({ type: 'user.edit' })

describe('user.sendVerifyCode', () => {
  test('returns a nonce when sending verify code for change-phone-number', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000001'
    })

    expect(result).toHaveProperty('nonce')
    expect(typeof result.nonce).toBe('string')
    expect(result.nonce.length).toBeGreaterThan(0)
  })

  test('returns a nonce when sending verify code for change-email-address', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result = await client.user.sendVerifyCode({
      notificationEvent: 'change-email-address',
      email: 'new@test.example'
    })

    expect(result).toHaveProperty('nonce')
    expect(typeof result.nonce).toBe('string')
    expect(result.nonce.length).toBeGreaterThan(0)
  })

  test('returns different nonces on subsequent calls', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result1 = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000001'
    })

    const result2 = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000001'
    })

    expect(result1.nonce).not.toBe(result2.nonce)
  })

  test('system client cannot call sendVerifyCode', async () => {
    const systemId = getUUID()
    const client = createSystemTestClient(systemId)

    await expect(
      client.user.sendVerifyCode({
        notificationEvent: 'change-phone-number',
        phoneNumber: '0700000001'
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('nonce is a valid base64 string of expected length', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const result = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000001'
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
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000001'
    })
    const result2 = await client2.user.sendVerifyCode({
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000002'
    })

    expect(result1.nonce).not.toBe(result2.nonce)
  })

  test('different notification events for the same user return different nonces', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const phoneResult = await client.user.sendVerifyCode({
      notificationEvent: 'change-phone-number',
      phoneNumber: '0700000001'
    })
    const emailResult = await client.user.sendVerifyCode({
      notificationEvent: 'change-email-address',
      email: 'new@test.example'
    })

    expect(phoneResult.nonce).not.toBe(emailResult.nonce)
  })

  describe('duplicate phone number', () => {
    const PHONE_NUMBER = '01711111111'
    test('throws CONFLICT when another user already has the requested phone number', async () => {
      const { users } = await setupTestCase()
      const adminClient = createTestClient(users[0], [USER_EDIT_SCOPE])
      await adminClient.user.update({ id: users[0].id, mobile: PHONE_NUMBER })

      const client2 = createTestClient(users[1])
      await expect(
        client2.user.sendVerifyCode({
          notificationEvent: 'change-phone-number',
          phoneNumber: PHONE_NUMBER
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    test('does not throw CONFLICT when the phone number belongs to the requesting user', async () => {
      const { users } = await setupTestCase()
      const adminClient = createTestClient(users[0], [USER_EDIT_SCOPE])
      await adminClient.user.update({ id: users[0].id, mobile: PHONE_NUMBER })

      const client1 = createTestClient(users[0])
      await expect(
        client1.user.sendVerifyCode({
          notificationEvent: 'change-phone-number',
          phoneNumber: PHONE_NUMBER
        })
      ).resolves.toHaveProperty('nonce')
    })
  })

  describe('duplicate email', () => {
    const EMAIL = 'shared@test.example'
    test('throws CONFLICT when another user already has the requested email', async () => {
      const { users } = await setupTestCase()
      const client2 = createTestClient(users[1])

      // seeder sets email to `user-${id}@test.example` for every user
      const user1Email = `user-${users[0].id}@test.example`

      await expect(
        client2.user.sendVerifyCode({
          notificationEvent: 'change-email-address',
          email: user1Email
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    test('throws CONFLICT when another user claims a freshly updated email', async () => {
      const { users } = await setupTestCase()
      const adminClient = createTestClient(users[0], [USER_EDIT_SCOPE])
      await adminClient.user.update({
        id: users[0].id,
        email: EMAIL
      })

      const client2 = createTestClient(users[1])
      await expect(
        client2.user.sendVerifyCode({
          notificationEvent: 'change-email-address',
          email: EMAIL
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    test('does not throw CONFLICT when the email belongs to the requesting user', async () => {
      const { users } = await setupTestCase()
      const client1 = createTestClient(users[0])

      const ownEmail = `user-${users[0].id}@test.example`
      await expect(
        client1.user.sendVerifyCode({
          notificationEvent: 'change-email-address',
          email: ownEmail
        })
      ).resolves.toHaveProperty('nonce')
    })
  })
})
