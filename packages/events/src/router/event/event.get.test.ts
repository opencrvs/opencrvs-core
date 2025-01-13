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

test('Returns 404 when not found', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.get('id-not-persisted')
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Returns event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent).toEqual({
    ...event,
    locationIds: [user.primaryOfficeId],
    userIds: [user.id]
  })
})

test('Returns event with all actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare(
    generator.event.actions.declare(event.id, { data: { name: 'John Doe' } })
  )

  await client.event.actions.validate(
    generator.event.actions.validate(event.id, {
      data: { favouritePlayer: 'Elena Rybakina' }
    })
  )

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent.actions).toHaveLength(3)
})
