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

import { getClient } from '@events/storage/__mocks__/mongodb'
import { createTestClient } from '@events/tests/utils'
import { payloadGenerator } from '@events/tests/generators'

const client = createTestClient()
const generator = payloadGenerator()

test('event can be created and fetched', async () => {
  const event = await client.event.create(generator.event.create())

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent).toEqual(event)
})

test('creating an event is an idempotent operation', async () => {
  const db = await getClient()

  const payload = generator.event.create()

  await client.event.create(payload)
  await client.event.create(payload)

  expect(await db.collection('events').find().toArray()).toHaveLength(1)
})

test('event with unknown type cannot be created', async () => {
  await expect(
    client.event.create(
      generator.event.create({
        type: 'EVENT_TYPE_THAT_DOES_NOT_EXIST'
      })
    )
  ).rejects.toThrowErrorMatchingSnapshot()
})
