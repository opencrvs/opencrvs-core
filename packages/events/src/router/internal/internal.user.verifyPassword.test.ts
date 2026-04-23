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
import { createInternalTestClient, setupTestCase } from '@events/tests/utils'
import { generateSaltedHash } from '@events/service/auth/hash'

const caller = createInternalTestClient()

test('returns UNAUTHORIZED when user not found', async () => {
  await expect(
    caller.user.verifyPassword({
      username: 'nonexistent',
      password: 'somepassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns UNAUTHORIZED when password does not match', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  const { hash, salt } = await generateSaltedHash('correctpassword')

  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      mobile: '+447700900010',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'wrongpassuser',
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
    caller.user.verifyPassword({
      username: 'wrongpassuser',
      password: 'wrongpassword'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns user info when credentials are valid', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  const { hash, salt } = await generateSaltedHash('mypassword')

  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      firstname: 'John',
      surname: 'Doe',
      mobile: '+447700900011',
      email: 'john.doe@example.com',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'johndoe',
      passwordHash: hash,
      salt,
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .execute()

  const result = await caller.user.verifyPassword({
    username: 'johndoe',
    password: 'mypassword'
  })

  expect(result.id).toBe(userId)
  expect(result.status).toBe('active')
  expect(result.role).toBe('REGISTRATION_AGENT')
  expect(result.mobile).toBe('+447700900011')
  expect(result.email).toBe('john.doe@example.com')
  expect(result.name).toEqual([{ use: 'en', given: ['John'], family: 'Doe' }])
})
