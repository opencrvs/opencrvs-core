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
import { vi } from 'vitest'
import { appRouter, t } from './router'
import {
  setupServer,
  getClient,
  resetServer
} from './storage/__mocks__/mongodb'
import { ActionType } from '@opencrvs/commons'

const { createCallerFactory } = t

vi.mock('@events/storage/mongodb')

beforeAll(async () => {
  await setupServer()
})

afterEach(async () => {
  resetServer()
})

function createClient() {
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({})
  return caller
}

const client = createClient()
test('event can be created and fetched', async () => {
  const event = await client.event.create({
    transactionId: '1',
    event: { type: 'birth', fields: [] }
  })

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent).toEqual(event)
})

test('creating an event is an idempotent operation', async () => {
  const db = await getClient()

  await client.event.create({
    transactionId: '1',
    event: { type: 'birth', fields: [] }
  })

  await client.event.create({
    transactionId: '1',
    event: { type: 'birth', fields: [] }
  })

  expect(await db.collection('events').find().toArray()).toHaveLength(1)
})

test('stored events can be modified', async () => {
  const originalEvent = await client.event.create({
    transactionId: '1',
    event: { type: 'birth', fields: [] }
  })

  const event = await client.event.patch({
    id: originalEvent.id,
    type: 'death',
    fields: []
  })

  expect(event.updatedAt).not.toBe(originalEvent.updatedAt)
  expect(event.type).toBe('death')
})

test('actions can be added to created events', async () => {
  const originalEvent = await client.event.create({
    transactionId: '1',
    event: { type: 'birth', fields: [] }
  })

  const event = await client.event.actions.create({
    eventId: originalEvent.id,
    action: {
      type: ActionType.REGISTER,
      fields: [],
      identifiers: {
        trackingId: '123',
        registrationNumber: '456'
      }
    }
  })

  expect(event.actions).toContainEqual(
    expect.objectContaining({
      type: ActionType.REGISTER,
      identifiers: {
        trackingId: '123',
        registrationNumber: '456'
      }
    })
  )
})
