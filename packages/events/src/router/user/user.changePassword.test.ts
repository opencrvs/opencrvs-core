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
import { sql } from 'kysely'
import { getUUID } from '@opencrvs/commons'
import { t } from '@events/router/trpc'
import { appRouter } from '@events/router/router'
import { setupTestCase } from '@events/tests/utils'
import { generateHash, generateSaltedHash } from '@events/service/auth/hash'

const { createCallerFactory } = t
const publicCaller = createCallerFactory(appRouter)({})

test('returns UNAUTHORIZED when user not found', async () => {
  await expect(
    publicCaller.user.changePassword({
      userId: getUUID(),
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('updates the password hash without existingPassword (reset flow)', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  const { hash: initialHash, salt } = await generateSaltedHash('oldpassword')

  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      mobile: '+447700900001',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'testuser',
      passwordHash: initialHash,
      salt,
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .execute()

  await publicCaller.user.changePassword({ userId, password: 'newpassword' })

  const updated = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash', 'salt'])
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()

  const expectedHash = await generateHash('newpassword', updated.salt)
  expect(updated.passwordHash).toBe(expectedHash)
  // Salt must not change
  expect(updated.salt).toBe(salt)
})

test('updates the password when existingPassword matches (change flow)', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  const { hash, salt } = await generateSaltedHash('oldpassword')

  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      mobile: '+447700900002',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'changeuser',
      passwordHash: hash,
      salt,
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .execute()

  await publicCaller.user.changePassword({
    userId,
    existingPassword: 'oldpassword',
    password: 'newpassword'
  })

  const updated = await eventsDb
    .selectFrom('userCredentials')
    .select(['passwordHash'])
    .where('userId', '=', userId)
    .executeTakeFirstOrThrow()

  const expectedHash = await generateHash('newpassword', salt)
  expect(updated.passwordHash).toBe(expectedHash)
})

test('returns UNAUTHORIZED when existingPassword does not match', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  const { hash, salt } = await generateSaltedHash('correctpassword')

  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      mobile: '+447700900003',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'wrongpass',
      passwordHash: hash,
      salt,
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .execute()

  await expect(
    publicCaller.user.changePassword({
      userId,
      existingPassword: 'wrongpassword',
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns UNAUTHORIZED when user is not active and existingPassword is provided', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  const { hash, salt } = await generateSaltedHash('password')

  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      mobile: '+447700900004',
      role: 'REGISTRATION_AGENT',
      status: 'deactivated',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'inactiveuser',
      passwordHash: hash,
      salt,
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .execute()

  await expect(
    publicCaller.user.changePassword({
      userId,
      existingPassword: 'password',
      password: 'newpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})
