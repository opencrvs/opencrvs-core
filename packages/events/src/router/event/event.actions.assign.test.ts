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
import { ActionType } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test(`Should add an ${ActionType.ASSIGN} action when last action is not ${ActionType.ASSIGN}`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.assignment.unassign(
    generator.event.actions.unassign(originalEvent.id)
  )

  const response = await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id)
  )
  expect(response.actions.at(-1)?.type).toEqual(ActionType.ASSIGN)
})

test(`Should not add any new actions when assigned to the same user`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const response = await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
  )

  expect(response.actions.map(({ type }) => type)).toEqual([
    ActionType.CREATE,
    ActionType.ASSIGN
  ])

  const response2 = await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
  )

  expect(response2).toEqual(response)

  const finalEvent = await client.event.get(originalEvent.id)

  expect(finalEvent.actions.map(({ type }) => type)).toEqual([
    ActionType.CREATE,
    ActionType.ASSIGN // only a single assign entry
  ])
})

test(`Should throw error when assigned to a different user`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await expect(
    client.event.actions.assignment.assign(
      generator.event.actions.assign(originalEvent.id, { assignedTo: 'user-2' })
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'CONFLICT' }))
})
