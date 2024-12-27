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
import { ActionType } from '@opencrvs/commons'

const client = createTestClient()
const generator = payloadGenerator()

test('actions can be added to created events', async () => {
  const originalEvent = await client.event.create(generator.event.create())

  const event = await client.event.actions.declare(
    generator.event.actions.declare(originalEvent.id)
  )

  expect(event.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.DECLARE })
  ])
})

test('Action data can be retrieved', async () => {
  const originalEvent = await client.event.create(generator.event.create())

  const data = { name: 'John Doe', age: 42 }
  await client.event.actions.declare(
    generator.event.actions.declare(originalEvent.id, {
      data
    })
  )

  const updatedEvent = await client.event.get(originalEvent.id)

  expect(updatedEvent.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({
      type: ActionType.DECLARE,
      data
    })
  ])
})
