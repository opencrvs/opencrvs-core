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
import { SCOPES } from '@opencrvs/commons'
import { ActionType } from '@opencrvs/commons'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.event.list()).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`allows access with required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_READ])

  await expect(client.event.list()).resolves.not.toThrow()
})

test('Returns empty list when no events', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedEvents = await client.event.list()

  expect(fetchedEvents).toEqual([])
})

test('Returns multiple events', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  await Promise.all(
    new Array(10)
      .fill(null)
      .map(async () => createEvent(client, generator, [ActionType.DECLARE]))
  )

  const events = await client.event.list()

  expect(events).toHaveLength(10)
})

test('Does not return draft events even if they are created by the fetching user', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  // Create 3 events created by the fetching user
  await client.event.create(generator.event.create())
  await client.event.create(generator.event.create())
  await client.event.create(generator.event.create())

  // Create 2 events created by other users
  const { user: otherUser } = await setupTestCase()
  const otherClient = createTestClient(otherUser)
  await otherClient.event.create(generator.event.create())
  await otherClient.event.create(generator.event.create())

  const events = await client.event.list()

  expect(events).toHaveLength(0)
})
