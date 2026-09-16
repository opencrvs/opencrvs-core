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
import { http, HttpResponse } from 'msw'
import {
  ActionStatus,
  ActionType,
  encodeScope,
  EventStatus,
  getCurrentEventState,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

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

describe('3rd party integration confirmation behaviour', () => {
  function mockActionApi(action: ActionType, status: number) {
    return mswServer.use(
      http.post<never, { actionId: string }>(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
        () => {
          return HttpResponse.json({}, { status })
        }
      )
    )
  }

  test('Throws when integration responds with 202 when keepAssignment is given', async () => {
    mockActionApi(ActionType.UNARCHIVE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )
    await client.event.actions.archive.request(
      generator.event.actions.archive(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.unarchive.request(
        generator.event.actions.unarchive(event.id, { keepAssignment: true })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfRejected is given', async () => {
    mockActionApi(ActionType.UNARCHIVE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.archive.request(
      generator.event.actions.archive(event.id, {
        keepAssignment: true
      })
    )

    await expect(
      client.event.actions.unarchive.request(
        generator.event.actions.unarchive(event.id, {
          keepAssignmentIfRejected: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfAccepted is given', async () => {
    mockActionApi(ActionType.UNARCHIVE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.archive.request(
      generator.event.actions.archive(event.id, {
        keepAssignmentIfAccepted: true
      })
    )

    await expect(
      client.event.actions.unarchive.request(
        generator.event.actions.unarchive(event.id, {
          keepAssignmentIfAccepted: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Unassigns when integration responds with 202', async () => {
    mockActionApi(ActionType.UNARCHIVE, 202)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.archive.request(
      generator.event.actions.archive(event.id, { keepAssignment: true })
    )

    const response = await client.event.actions.unarchive.request(
      generator.event.actions.unarchive(event.id)
    )

    const lastAction = response.actions[response.actions.length - 1]

    expect(lastAction.type).toEqual(ActionType.UNASSIGN)
    expect(lastAction.status).toEqual(ActionStatus.Accepted)

    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['unarchive:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.ARCHIVED)
    expect(currentState.assignedTo).toEqual(undefined)
  })

  test('Keeps assignment when integration responds with 500', async () => {
    mockActionApi(ActionType.UNARCHIVE, 500)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.archive.request(
      generator.event.actions.archive(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.unarchive.request(
        generator.event.actions.unarchive(event.id)
      )
    ).rejects.toThrow(
      'Unexpected failure from country config action confirmation API'
    )

    const eventAfterFailure = await client.event.get({ eventId: event.id })

    const currentState = getCurrentEventState(
      eventAfterFailure,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['unarchive:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.ARCHIVED)
    expect(currentState.assignedTo).toEqual(user.id)
  })
})
