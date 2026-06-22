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

async function requestContactChange(
  client: ReturnType<typeof createTestClient>,
  email: string
) {
  const { nonce } = await client.user.requestContactChange({
    notificationEvent: 'change-email-address',
    email
  })
  return nonce
}

describe('user.changeEmail', () => {
  test('updates the email address', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    const newEmail = 'new.address@test.example'
    const nonce = await requestContactChange(client, newEmail)

    await client.user.changeEmail({
      userId: user.id,
      email: newEmail,
      nonce,
      verifyCode: VERIFY_CODE
    })

    const updatedUser = await client.user.get(user.id)
    expect(updatedUser).toMatchObject({ email: newEmail })
  })

  test('can change email address more than once', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    const firstEmail = 'first@test.example'
    const nonce1 = await requestContactChange(client, firstEmail)
    await client.user.changeEmail({
      userId: user.id,
      email: firstEmail,
      nonce: nonce1,
      verifyCode: VERIFY_CODE
    })

    const secondEmail = 'second@test.example'
    const nonce2 = await requestContactChange(client, secondEmail)
    await client.user.changeEmail({
      userId: user.id,
      email: secondEmail,
      nonce: nonce2,
      verifyCode: VERIFY_CODE
    })

    const updatedUser = await client.user.get(user.id)
    expect(updatedUser).toMatchObject({ email: secondEmail })
  })

  test('rejects an incorrect verification code', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)
    const newEmail = 'new.address@test.example'
    const nonce = await requestContactChange(client, newEmail)

    await expect(
      client.user.changeEmail({
        userId: user.id,
        email: newEmail,
        nonce,
        verifyCode: '999999'
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })

    const unchangedUser = await client.user.get(user.id)
    expect(unchangedUser).not.toMatchObject({ email: newEmail })
  })

  test("cannot change another user's email address", async () => {
    const { user, users } = await setupTestCase()
    const client = createTestClient(user)
    const newEmail = 'new.address@test.example'
    const nonce = await requestContactChange(client, newEmail)

    await expect(
      client.user.changeEmail({
        userId: users[1].id,
        email: newEmail,
        nonce,
        verifyCode: VERIFY_CODE
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  test('rejects a duplicate email address', async () => {
    const { users } = await setupTestCase()
    const client1 = createTestClient(users[0])
    const client2 = createTestClient(users[1])

    const sharedEmail = 'shared@test.example'
    const nonce1 = await requestContactChange(client1, sharedEmail)
    await client1.user.changeEmail({
      userId: users[0].id,
      email: sharedEmail,
      nonce: nonce1,
      verifyCode: VERIFY_CODE
    })

    // user2 tries to claim the same email after user1 has it
    const nonce2 = await requestContactChange(client2, 'other@test.example')
    await expect(
      client2.user.changeEmail({
        userId: users[1].id,
        email: sharedEmail,
        nonce: nonce2,
        verifyCode: VERIFY_CODE
      })
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })
})
