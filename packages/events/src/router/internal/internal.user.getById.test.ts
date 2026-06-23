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
import { createInternalTestClient, setupTestCase } from '@events/tests/utils'
import { createSystemClient } from '@events/storage/postgres/events/system-clients'

const caller = createInternalTestClient()

test('returns role and status for an existing user', async () => {
  const { eventsDb, locations } = await setupTestCase()

  const userId = getUUID()
  await eventsDb
    .insertInto('users')
    .values({
      id: userId,
      role: 'REGISTRATION_AGENT',
      status: 'active',
      officeId: locations[0].id,
      firstname: 'Jane',
      surname: 'Doe',
      email: 'jane.doe@example.com'
    })
    .execute()

  const result = await caller.user.getById(userId)

  expect(result).toEqual({
    id: userId,
    role: 'REGISTRATION_AGENT',
    status: 'active'
  })
})

test('returns NOT_FOUND when the user does not exist', async () => {
  await expect(caller.user.getById(getUUID())).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})

test('returns NOT_FOUND for a system client id — system clients are in a separate table', async () => {
  // System clients live in `systemClients`, not `users`. Passing a system
  // client id to getById must never return a result; the users-table query
  // excludes them by construction.
  const systemId = getUUID()
  await createSystemClient({
    id: systemId,
    name: 'Test System Client',
    createdBy: getUUID(),
    secretHash: 'hash',
    salt: 'salt',
    shaSecret: 'shaSecret'
  })

  await expect(caller.user.getById(systemId)).rejects.toMatchObject(
    new TRPCError({ code: 'NOT_FOUND' })
  )
})
