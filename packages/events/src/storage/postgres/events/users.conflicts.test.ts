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

import { getUUID, UUID } from '@opencrvs/commons'
import { setupTestCase } from '@events/tests/utils'
import {
  createUserWithCredentials,
  updateUserById,
  updateUsernameById
} from './users'
import { NewUsers } from './schema/app/Users'

function newUser(officeId: UUID, overrides: Partial<NewUsers> = {}) {
  const id = getUUID()

  return {
    user: {
      id,
      officeId,
      role: 'admin',
      status: 'active',
      legacyId: null,
      firstname: 'given',
      surname: 'family',
      fullHonorificName: null,
      email: `user-${id}@test.example`,
      mobile: null,
      device: null,
      signaturePath: null,
      profileImagePath: null,
      ...overrides
    } satisfies NewUsers,
    cred: {
      username: `user-${id}`,
      passwordHash: 'dummy-hash',
      salt: 'dummy-salt',
      securityQuestions: {}
    }
  }
}

test('a duplicate email on create is a conflict naming the email', async () => {
  const { user } = await setupTestCase()
  const first = newUser(user.primaryOfficeId)
  await createUserWithCredentials(first.user, first.cred)

  const second = newUser(user.primaryOfficeId, { email: first.user.email })

  await expect(
    createUserWithCredentials(second.user, second.cred)
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'A user with the same email already exists'
  })
})

test('a duplicate mobile on create is a conflict naming the mobile', async () => {
  const { user } = await setupTestCase()
  const mobile = '+260700000001'
  const first = newUser(user.primaryOfficeId, { mobile })
  await createUserWithCredentials(first.user, first.cred)

  const second = newUser(user.primaryOfficeId, { mobile })

  await expect(
    createUserWithCredentials(second.user, second.cred)
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'A user with the same mobile already exists'
  })
})

test('a duplicate username on create is a conflict naming the username', async () => {
  const { user } = await setupTestCase()
  const first = newUser(user.primaryOfficeId)
  await createUserWithCredentials(first.user, first.cred)

  const second = newUser(user.primaryOfficeId)

  await expect(
    createUserWithCredentials(second.user, {
      ...second.cred,
      username: first.cred.username
    })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'A user with the same username already exists'
  })
})

test('a duplicate email on update is a conflict naming the email', async () => {
  const { user } = await setupTestCase()
  const first = newUser(user.primaryOfficeId)
  const second = newUser(user.primaryOfficeId)
  await createUserWithCredentials(first.user, first.cred)
  await createUserWithCredentials(second.user, second.cred)

  await expect(
    updateUserById(second.user.id, { email: first.user.email })
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'A user with the same email already exists'
  })
})

test('a duplicate username on update is a conflict naming the username', async () => {
  const { user } = await setupTestCase()
  const first = newUser(user.primaryOfficeId)
  const second = newUser(user.primaryOfficeId)
  await createUserWithCredentials(first.user, first.cred)
  await createUserWithCredentials(second.user, second.cred)

  await expect(
    updateUsernameById(second.user.id, first.cred.username)
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: 'A user with the same username already exists'
  })
})

test('a unique violation on an unmapped constraint is left alone', async () => {
  const { user } = await setupTestCase()
  const first = newUser(user.primaryOfficeId)
  await createUserWithCredentials(first.user, first.cred)

  // `users_pkey` guards nothing a caller supplied, so it is deliberately absent
  // from the mapping and must surface as the raw driver error rather than a
  // conflict blaming a field the caller can do nothing about.
  const second = newUser(user.primaryOfficeId, { id: first.user.id })

  await expect(
    createUserWithCredentials(second.user, second.cred)
  ).rejects.toMatchObject({
    code: '23505',
    constraint: 'users_pkey'
  })
})
