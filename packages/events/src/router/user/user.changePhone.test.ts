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

import { createTestClient, setupTestCase } from '@events/tests/utils'

// TWO_FA_ENABLED is false in the test environment, so the verification
// code is always the default one
const VERIFY_CODE = '000000'

async function requestPhoneChange(client: ReturnType<typeof createTestClient>) {
  const { nonce } = await client.user.requestPhoneChange({
    phoneNumber: '0700000001'
  })
  return nonce
}

describe('user.changePhone', () => {
  test('updates the phone number when given a number in local format', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    const nonce = await requestPhoneChange(client)

    // Matches the PHONE_NUMBER_PATTERN (^01[1-9][0-9]{8}$) served by the
    // mocked country config
    const phoneNumber = '01711111111'

    await client.user.changePhone({
      userId: user.id,
      phoneNumber,
      nonce,
      verifyCode: VERIFY_CODE
    })

    const updatedUser = await client.user.get(user.id)
    expect(updatedUser).toMatchObject({ mobile: phoneNumber })
  })

  test('rejects a phone number in international (MSISDN) format', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    const nonce = await requestPhoneChange(client)

    await expect(
      client.user.changePhone({
        userId: user.id,
        phoneNumber: '+260911111111',
        nonce,
        verifyCode: VERIFY_CODE
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })

    const unchangedUser = await client.user.get(user.id)
    expect(unchangedUser).not.toMatchObject({ mobile: '+260911111111' })
  })

  test('rejects a phone number that does not match the configured pattern', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    const nonce = await requestPhoneChange(client)

    await expect(
      client.user.changePhone({
        userId: user.id,
        phoneNumber: '12345',
        nonce,
        verifyCode: VERIFY_CODE
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('rejects an incorrect verification code', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    const nonce = await requestPhoneChange(client)

    await expect(
      client.user.changePhone({
        userId: user.id,
        phoneNumber: '01711111111',
        nonce,
        verifyCode: '999999'
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test("cannot change another user's phone number", async () => {
    const { user, users } = await setupTestCase()
    const client = createTestClient(user)
    const nonce = await requestPhoneChange(client)

    await expect(
      client.user.changePhone({
        userId: users[1].id,
        phoneNumber: '01711111111',
        nonce,
        verifyCode: VERIFY_CODE
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})
