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

import { encodeScope } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

/**
 * The application-level duplicate checks are broader than the database's
 * unique constraints — they check before the write, and the username
 * generator retries until it finds a free name — so in normal operation they
 * always fire first and the constraint is only reachable when two creates
 * race.
 *
 * These stubs blind those checks so that the write reaches postgres and the
 * constraint is the thing that trips: `searchUsers` backs the email/mobile
 * check on the route, `isUsernameTaken` backs the username generator. What is
 * asserted below is route behaviour — a conflict naming the field rather than
 * an internal server error, which production masks entirely.
 */
vi.mock('@events/service/users/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@events/service/users/api')>()),
  searchUsers: vi.fn().mockResolvedValue([])
}))

vi.mock('@events/storage/postgres/events/users', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@events/storage/postgres/events/users')
  >()),
  isUsernameTaken: vi.fn().mockResolvedValue(false)
}))

async function createUserClient() {
  const { user } = await setupTestCase()

  return {
    client: createTestClient(user, [encodeScope({ type: 'user.create' })]),
    primaryOfficeId: user.primaryOfficeId
  }
}

test('A unique-constraint violation on email surfaces as a conflict naming email', async () => {
  const { client, primaryOfficeId } = await createUserClient()

  await client.user.create({
    email: 'duplicate.constraint@opencrvs.org',
    role: 'admin',
    name: { firstname: 'first', surname: 'holder' },
    primaryOfficeId
  })

  await expect(
    client.user.create({
      email: 'duplicate.constraint@opencrvs.org',
      role: 'admin',
      name: { firstname: 'second', surname: 'claimant' },
      primaryOfficeId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('email')
  })
})

test('A unique-constraint violation on mobile surfaces as a conflict naming mobile', async () => {
  const { client, primaryOfficeId } = await createUserClient()

  await client.user.create({
    email: 'mobile.holder@opencrvs.org',
    mobile: '01712345678',
    role: 'admin',
    name: { firstname: 'first', surname: 'holder' },
    primaryOfficeId
  })

  await expect(
    client.user.create({
      email: 'mobile.claimant@opencrvs.org',
      mobile: '01712345678',
      role: 'admin',
      name: { firstname: 'second', surname: 'claimant' },
      primaryOfficeId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('mobile')
  })
})

test('A unique-constraint violation on username surfaces as a conflict naming username', async () => {
  const { client, primaryOfficeId } = await createUserClient()

  const name = { firstname: 'shared', surname: 'username' }

  await client.user.create({
    email: 'username.holder@opencrvs.org',
    role: 'admin',
    name,
    primaryOfficeId
  })

  await expect(
    client.user.create({
      email: 'username.claimant@opencrvs.org',
      role: 'admin',
      name,
      primaryOfficeId
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining('username')
  })
})
