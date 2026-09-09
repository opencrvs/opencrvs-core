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
  encodeScope,
  EventStatus,
  getCurrentEventState,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.unarchive.request(
      generator.event.actions.unarchive('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.unarchive',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    })
  ])

  await expect(
    client.event.actions.unarchive.request(
      generator.event.actions.unarchive('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`restores the pre-archive status`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === 'CREATE'
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)
  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )
  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  const archivedEvent = await client.event.actions.archive.request(
    generator.event.actions.archive(originalEvent.id, { keepAssignment: true })
  )

  expect(
    getCurrentEventState(archivedEvent, tennisClubMembershipEvent).status
  ).toEqual(EventStatus.enum.ARCHIVED)

  const unarchivedEvent = await client.event.actions.unarchive.request(
    generator.event.actions.unarchive(originalEvent.id, {
      keepAssignment: true
    })
  )

  expect(
    getCurrentEventState(unarchivedEvent, tennisClubMembershipEvent).status
  ).toEqual(EventStatus.enum.DECLARED)
})

test(`unarchive action is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === 'CREATE'
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)
  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )
  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.archive.request(
    generator.event.actions.archive(originalEvent.id, { keepAssignment: true })
  )

  const unarchivePayload = generator.event.actions.unarchive(originalEvent.id, {
    keepAssignment: true
  })

  const firstResponse =
    await client.event.actions.unarchive.request(unarchivePayload)
  const secondResponse =
    await client.event.actions.unarchive.request(unarchivePayload)

  expect(firstResponse).toEqual(secondResponse)
})
