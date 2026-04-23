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
import { sql } from 'kysely'
import { getUUID } from '@opencrvs/commons'
import { createInternalTestClient, setupTestCase } from '@events/tests/utils'
import { env } from '@events/environment'
import { mswServer } from '../../tests/msw'

const caller = createInternalTestClient()

test('returns UNAUTHORIZED when user not found by mobile', async () => {
  await expect(
    caller.user.verifyUser({ mobile: '+447700900000' })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns UNAUTHORIZED when user not found by email', async () => {
  await expect(
    caller.user.verifyUser({ email: 'notfound@example.com' })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns CONFLICT when user has no security questions', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
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
      passwordHash: 'hash',
      salt: 'salt',
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .execute()

  await expect(
    caller.user.verifyUser({ mobile: '+447700900001' })
  ).rejects.toMatchObject(
    new TRPCError({
      code: 'CONFLICT',
      message: "User doesn't have security questions"
    })
  )
})

test('returns user info and a valid security question key on success (mobile)', async () => {
  const { eventsDb, locations } = await setupTestCase()

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/roles`, () =>
      HttpResponse.json([
        { id: 'REGISTRATION_AGENT', scopes: ['record.declare', 'record.read'] }
      ])
    )
  )

  const userId = getUUID()
  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      firstname: 'Jane',
      surname: 'Smith',
      mobile: '+447700900002',
      email: 'jane@example.com',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'jane.smith',
      passwordHash: 'hash',
      salt: 'salt',
      securityQuestions: sql`cast (${JSON.stringify([
        { questionKey: 'BIRTH_TOWN', answerHash: 'h1' },
        { questionKey: 'FIRST_CHILD_NAME', answerHash: 'h2' }
      ])} as jsonb)` as unknown as Record<string, unknown>
    })
    .execute()

  const result = await caller.user.verifyUser({ mobile: '+447700900002' })

  expect(result).toMatchObject({
    id: userId,
    username: 'jane.smith',
    mobile: '+447700900002',
    email: 'jane@example.com',
    status: 'active',
    name: [{ use: 'en', given: ['Jane'], family: 'Smith' }],
    scope: ['record.declare', 'record.read']
  })
  expect(['BIRTH_TOWN', 'FIRST_CHILD_NAME']).toContain(
    result.securityQuestionKey
  )
})

test('looks up user by email (case-insensitive)', async () => {
  const { eventsDb, locations } = await setupTestCase()

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/roles`, () =>
      HttpResponse.json([{ id: 'REGISTRATION_AGENT', scopes: [] }])
    )
  )

  const userId = getUUID()
  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      email: 'lookup@example.com',
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id
    })
    .execute()

  await eventsDb
    .insertInto('userCredentials')
    .values({
      userId,
      username: 'lookup.user',
      passwordHash: 'hash',
      salt: 'salt',
      securityQuestions: sql`cast (${JSON.stringify([
        { questionKey: 'BIRTH_TOWN', answerHash: 'h1' }
      ])} as jsonb)` as unknown as Record<string, unknown>
    })
    .execute()

  const result = await caller.user.verifyUser({
    email: 'LOOKUP@example.com'
  })

  expect(result.id).toBe(userId)
  expect(result.username).toBe('lookup.user')
})
