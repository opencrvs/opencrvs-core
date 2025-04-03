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
import { SCOPES } from '@opencrvs/commons'
import { ActionType } from '@opencrvs/commons/events'
import { TRPCError } from '@trpc/server'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.create(generator.event.create())
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access with required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARE])

  await expect(
    client.event.create(generator.event.create())
  ).resolves.not.toThrow()
})

test('event can be created and fetched', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())

  const fetchedEvent = await client.event.get(event.id)

  const fetchedEventWithoutReadAction = fetchedEvent.actions.slice(0, -1)
  expect(fetchedEventWithoutReadAction).toEqual(event.actions)

  expect(fetchedEvent.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({
      type: ActionType.READ
    })
  ])
})

test('created event should have be assigned a random 6 character tracking ID', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())

  // trackingId should be 6 characters long and include only uppercase letters and numbers
  expect(event.trackingId).toMatch(/^[A-Z0-9]{6}$/)

  const fetchedEvent = await client.event.get(event.id)
  expect(fetchedEvent.trackingId).toMatch(/^[A-Z0-9]{6}$/)
})

test('creating an event is an idempotent operation', async () => {
  const { user, generator, eventsDb } = await setupTestCase()
  const client = createTestClient(user)

  const payload = generator.event.create()

  await client.event.create(payload)
  await client.event.create(payload)

  expect(await eventsDb.collection('events').find().toArray()).toHaveLength(1)
})

test('event with unknown type cannot be created', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  await expect(
    client.event.create(
      generator.event.create({
        type: 'EVENT_TYPE_THAT_DOES_NOT_EXIST'
      })
    )
  ).rejects.toThrowErrorMatchingSnapshot()
})
