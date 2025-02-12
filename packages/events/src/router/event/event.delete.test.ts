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

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.delete({
      eventId: 'event-test-id-12345'
    })
  ).rejects.matchSnapshot()
})

test('should return 404 if event does not exist', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DELETE])

  await expect(
    client.event.delete({ eventId: 'some event' })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('stored events can be deleted', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DELETE])

  const event = await client.event.create(generator.event.create())

  // at this point event should exist
  expect(client.event.get(event.id)).toBeDefined()

  const removedEvent = await client.event.delete({ eventId: event.id })
  expect(removedEvent.id).toBe(event.id)

  // now event should be removed
  await expect(client.event.get(event.id)).rejects.toThrow(
    `Event not found with ID: ${event.id}`
  )
})
