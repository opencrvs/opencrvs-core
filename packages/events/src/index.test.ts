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
import { appRouter, t } from './router'
import { getClient } from './storage/__mocks__/mongodb'

import { getUUID } from '@opencrvs/commons'

const { createCallerFactory } = t

function createClient() {
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({
    user: { id: '1', primaryOfficeId: '123' },
    token: 'NOT_A_REAL_TOKEN'
  })
  return caller
}

const client = createClient()

test('event can be created and fetched', async () => {
  const event = await client.event.create({
    transactionId: '1',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  })

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent).toEqual(event)
})

test('creating an event is an idempotent operation', async () => {
  const db = await getClient()

  await client.event.create({
    transactionId: '1',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  })

  await client.event.create({
    transactionId: '1',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  })

  expect(await db.collection('events').find().toArray()).toHaveLength(1)
})

test('stored events can be modified', async () => {
  const originalEvent = await client.event.create({
    transactionId: '1',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  })

  const event = await client.event.patch({
    id: originalEvent.id,
    type: 'death',
    transactionId: getUUID()
  })

  expect(event.updatedAt).not.toBe(originalEvent.updatedAt)
  expect(event.type).toBe('death')
})

test('actions can be added to created events', async () => {
  const originalEvent = await client.event.create({
    transactionId: '1',
    type: 'TENNIS_CLUB_MEMBERSHIP'
  })

  const event = await client.event.actions.declare({
    eventId: originalEvent.id,
    transactionId: '2',
    data: {}
  })

  expect(event.actions).toEqual([
    expect.objectContaining({ type: 'CREATE' }),
    expect.objectContaining({ type: 'DECLARE' })
  ])
})
