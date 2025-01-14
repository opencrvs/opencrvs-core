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
import { createTestClient } from '@events/tests/utils'
import { payloadGenerator } from '@events/tests/generators'
import { EventStatus } from '@opencrvs/commons'

const client = createTestClient()
const generator = payloadGenerator()

test('Returns empty list when no events', async () => {
  const fetchedEvents = await client.events.get()

  expect(fetchedEvents).toEqual([])
})

test('Returns multiple events', async () => {
  for (let i = 0; i < 10; i++) {
    await client.event.create(generator.event.create())
  }

  const events = await client.events.get()

  expect(events).toHaveLength(10)
})

test.only('Returns aggregated event with updated status and values', async () => {
  const initialData = { name: 'John Doe', favouriteFruit: 'Banana' }
  const event = await client.event.create(generator.event.create())
  await client.event.actions.declare(
    generator.event.actions.declare(event.id, {
      data: initialData
    })
  )

  const initialEvents = await client.events.get()

  expect(initialEvents).toHaveLength(1)
  expect(initialEvents[0].status).toBe(EventStatus.DECLARED)
  expect(initialEvents[0].data).toEqual(initialData)

  const updatedData = { name: 'John Doe', favouriteFruit: 'Strawberry' }
  await client.event.actions.declare(
    generator.event.actions.declare(event.id, {
      data: updatedData
    })
  )

  const updatedEvents = await client.events.get()

  expect(updatedEvents).toHaveLength(1)

  expect(updatedEvents[0].status).toBe(EventStatus.DECLARED)
  expect(updatedEvents[0].data).toEqual(updatedData)
})
