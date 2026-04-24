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
import { getUUID } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { env } from '@events/environment'
import { mswServer } from '../../tests/msw'

function mockGetUser(user: {
  id: string
  name: Array<{ use: string; given: string[]; family: string }>
  mobile?: string
  email?: string
}) {
  mswServer.use(
    http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () => {
      return HttpResponse.json({
        ...user,
        mobile: user.mobile ?? '+8801234567890',
        email: user.email ?? 'test@example.com'
      })
    })
  )
}

describe('user.sendVerifyCode', () => {
  test('returns a nonce when sending verify code for change-phone-number', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    mockGetUser(user)

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

    mockGetUser(user)

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

    mockGetUser(user)

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
})
