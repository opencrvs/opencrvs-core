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
import {
  ActionStatus,
  ActionType,
  encodeScope,
  getUUID,
  EventDocumentOnlyLastAction
} from '@opencrvs/commons'

import { createTestClient, setupTestCase } from '@events/tests/utils'

describe('Without scope: record.unassign-others', () => {
  test('Can not unassign record that is assigned to someone else', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.read',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      'record.declare[event=birth|death|tennis-club-membership]'
    ])
    const { user: user2 } = await setupTestCase()
    const client2 = createTestClient(user2, [
      encodeScope({
        type: 'record.create',
        options: {
          event: ['birth', 'death', 'tennis-club-membership']
        }
      }),
      'record.declare[event=birth|death|tennis-club-membership]'
    ])
    const payload = generator.event.create()

    const originalEvent = await client.event.create(payload)

    await client.event.actions.assignment.assign(
      generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
    )
    const response = client2.event.actions.assignment.unassign(
      generator.event.actions.unassign(originalEvent.id)
    )
    await expect(response).rejects.toMatchObject(
      new TRPCError({ code: 'FORBIDDEN' })
    )
  })

  describe('If assigned to self', () => {
    test(`If there is no ${ActionType.UNASSIGN} action after last ${ActionType.ASSIGN} action, should not throw error and should add unassign action`, async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({
          type: 'record.read',
          options: {
            event: ['birth', 'death', 'tennis-club-membership']
          }
        }),
        encodeScope({
          type: 'record.create',
          options: {
            event: ['birth', 'death', 'tennis-club-membership']
          }
        }),
        'record.declare[event=birth|death|tennis-club-membership]'
      ])
      const originalEvent = await client.event.create(generator.event.create())

      await client.event.actions.assignment.assign(
        generator.event.actions.assign(originalEvent.id, {
          assignedTo: user.id
        })
      )
      const response = await client.event.actions.assignment.unassign(
        generator.event.actions.unassign(originalEvent.id)
      )
      expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
    })

    test(`If there is ${ActionType.UNASSIGN} action after last ${ActionType.ASSIGN} action, should not throw error and should not add unassign action`, async () => {
      const { user, generator, eventsDb } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({
          type: 'record.read',
          options: {
            event: ['birth', 'death', 'tennis-club-membership']
          }
        }),
        encodeScope({
          type: 'record.create',
          options: {
            event: ['birth', 'death', 'tennis-club-membership']
          }
        }),
        'record.declare[event=birth|death|tennis-club-membership]'
      ])
      const originalEvent = await client.event.create(generator.event.create())

      await client.event.actions.assignment.assign(
        generator.event.actions.assign(originalEvent.id, {
          assignedTo: user.id
        })
      )
      const firstResponse = await client.event.actions.assignment.unassign(
        generator.event.actions.unassign(originalEvent.id)
      )

      const actionsBeforeSecondAssign = await eventsDb
        .selectFrom('eventActions')
        .where('eventId', '=', originalEvent.id)
        .execute()

      const secondResponse = await client.event.actions.assignment.unassign(
        generator.event.actions.unassign(originalEvent.id)
      )

      const actionsAfterSecondAssign = await eventsDb
        .selectFrom('eventActions')
        .where('eventId', '=', originalEvent.id)
        .execute()

      // Action is idempotent (state stays the same regardless of multiple calls)
      expect(actionsAfterSecondAssign).toEqual(actionsBeforeSecondAssign)

      EventDocumentOnlyLastAction.parse(firstResponse)
      EventDocumentOnlyLastAction.parse(secondResponse)
      // Second request will not receive action on the response payload.
      expect(firstResponse.actions).toHaveLength(1)
      expect(secondResponse.actions).toHaveLength(0)
    })
  })
})

test(`Can unassign record that is assigned to someone else, if user has unassign scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.read',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    }),
    encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    }),
    'record.declare[event=birth|death|tennis-club-membership]'
  ])
  const { user: user2 } = await setupTestCase()
  const client2 = createTestClient(user2)
  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
  )
  const response = await client2.event.actions.assignment.unassign(
    generator.event.actions.unassign(originalEvent.id)
  )

  expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
})

test(`${ActionType.UNASSIGN} action deletes draft`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.read',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    }),
    encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    }),
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
  )
  const draftData = {
    type: ActionType.DECLARE,
    declaration: {
      ...generator.event.actions.declare(originalEvent.id).declaration,
      'applicant.image': {
        type: 'image/png',
        originalFilename: 'abcd.png',
        path: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
      }
    },
    transactionId: getUUID(),
    eventId: originalEvent.id,
    status: ActionStatus.Requested
  }

  await client.event.draft.create(draftData)
  const draftsBeforeUnassign = await client.event.draft.list()

  expect(draftsBeforeUnassign).not.toEqual([])

  const response = await client.event.actions.assignment.unassign(
    generator.event.actions.unassign(originalEvent.id)
  )

  const draftsAfterUnassign = await client.event.draft.list()
  expect(draftsAfterUnassign).toEqual([])

  expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
})

test(`${ActionType.UNASSIGN} is idempotent`, async () => {
  const { user, generator, eventsDb } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.read',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    }),
    encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    }),
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
  )
  const draftData = {
    type: ActionType.DECLARE,
    declaration: {
      ...generator.event.actions.declare(originalEvent.id).declaration,
      'applicant.image': {
        type: 'image/png',
        originalFilename: 'abcd.png',
        path: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
      }
    },
    transactionId: getUUID(),
    eventId: originalEvent.id,
    status: ActionStatus.Requested
  }

  await client.event.draft.create(draftData)
  const draftsBeforeUnassign = await client.event.draft.list()

  expect(draftsBeforeUnassign).not.toEqual([])

  const unassignPayload = generator.event.actions.unassign(originalEvent.id)
  const firstResponse =
    await client.event.actions.assignment.unassign(unassignPayload)

  const actionsBeforeSecondAssign = await eventsDb
    .selectFrom('eventActions')
    .where('eventId', '=', originalEvent.id)
    .execute()

  const secondResponse =
    await client.event.actions.assignment.unassign(unassignPayload)

  const actionsAfterSecondAssign = await eventsDb
    .selectFrom('eventActions')
    .where('eventId', '=', originalEvent.id)
    .execute()

  // Action is idempotent (state stays the same regardless of multiple calls)
  expect(actionsAfterSecondAssign).toEqual(actionsBeforeSecondAssign)

  EventDocumentOnlyLastAction.parse(firstResponse)
  EventDocumentOnlyLastAction.parse(secondResponse)
  // Second request will not receive action on the response payload.
  expect(firstResponse.actions).toHaveLength(1)
  expect(secondResponse.actions).toHaveLength(0)
})
