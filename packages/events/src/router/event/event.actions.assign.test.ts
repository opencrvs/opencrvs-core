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
import { ActionType, EventDocumentOnlyLastAction } from '@opencrvs/commons'
import {
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'

test(`Should add an ${ActionType.ASSIGN} action when last action is not ${ActionType.ASSIGN}`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.assignment.unassign(
    generator.event.actions.unassign(originalEvent.id)
  )

  const assignmentResponse = await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id)
  )
  expect(assignmentResponse.actions.at(-1)?.type).toEqual(ActionType.ASSIGN)
  expect(assignmentResponse.actions).toHaveLength(1)

  const eventAfterActions = await client.event.get({
    eventId: originalEvent.id
  })

  expect(
    sanitizeForSnapshot(eventAfterActions, UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
})

test('Should not add any new actions when assigned to the same user', async () => {
  const { user, generator, eventsDb } = await setupTestCase()
  const client = createTestClient(user)

  const createdEvent = await client.event.create(generator.event.create())

  expect(createdEvent.actions.map(({ type }) => type)).toEqual([
    ActionType.CREATE,
    ActionType.ASSIGN
  ])

  const firstResponse = await client.event.actions.assignment.assign(
    generator.event.actions.assign(createdEvent.id, { assignedTo: user.id })
  )

  const actionsBeforeSecondAssign = await eventsDb
    .selectFrom('eventActions')
    .where('eventId', '=', createdEvent.id)
    .execute()

  const secondResponse = await client.event.actions.assignment.assign(
    generator.event.actions.assign(createdEvent.id, { assignedTo: user.id })
  )

  const actionsAfterSecondAssign = await eventsDb
    .selectFrom('eventActions')
    .where('eventId', '=', createdEvent.id)
    .execute()

  // Action is idempotent (state stays the same regardless of multiple calls)
  expect(actionsAfterSecondAssign).toEqual(actionsBeforeSecondAssign)

  EventDocumentOnlyLastAction.parse(firstResponse)
  EventDocumentOnlyLastAction.parse(secondResponse)
  // requests will not receive action on the response payload for already assigned event.
  expect(firstResponse.actions).toHaveLength(0)
  expect(secondResponse.actions).toHaveLength(0)

  const finalEvent = await client.event.get({ eventId: createdEvent.id })

  expect(finalEvent.actions.map(({ type }) => type)).toEqual([
    ActionType.CREATE,
    ActionType.ASSIGN, // only a single assign entry
    ActionType.READ
  ])
})

test('Should throw error when assigned to a different user', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await expect(
    client.event.actions.assignment.assign(
      generator.event.actions.assign(originalEvent.id, { assignedTo: 'user-2' })
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'CONFLICT' }))
})
