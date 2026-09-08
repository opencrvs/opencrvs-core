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
    client.event.actions.archive.request(
      generator.event.actions.archive('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.archive',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    })
  ])

  await expect(
    client.event.actions.archive.request(
      generator.event.actions.archive('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

//@todo fix after implementing MARK_AS_DUPLICATE action
test.skip(`contains both ${ActionType.MARK_AS_DUPLICATE} and ${ActionType.ARCHIVE} actions when marked as duplicate`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const declareInput = generator.event.actions.declare(originalEvent.id)

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await client.event.actions.declare.request(declareInput)

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })
  const actions = (
    await client.event.actions.archive.request(
      generator.event.actions.archive(originalEvent.id)
    )
  ).actions.map(({ type }) => type)

  expect(actions.slice(-3)).toEqual([
    ActionType.MARK_AS_DUPLICATE,
    ActionType.ARCHIVE,
    ActionType.UNASSIGN
  ])
})

test(`should only contain ${ActionType.ARCHIVE} action if not marked as duplicate`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const declareInput = generator.event.actions.declare(originalEvent.id)

  await client.event.actions.declare.request(declareInput)
  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  const actions = (
    await client.event.actions.archive.request(
      generator.event.actions.archive(originalEvent.id)
    )
  ).actions.map(({ type }) => type)

  expect(actions.at(-2)).toStrictEqual(ActionType.ARCHIVE)
  expect(actions.at(-3)).not.toStrictEqual(ActionType.MARK_AS_DUPLICATE)
})

test(`${ActionType.ARCHIVE} stores no reason when none is given`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
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

  const event = await client.event.actions.archive.request(
    generator.event.actions.archive(originalEvent.id)
  )

  const archiveActions = event.actions.flatMap((action) =>
    action.type === ActionType.ARCHIVE &&
    action.status === ActionStatus.Accepted
      ? [action]
      : []
  )

  expect(archiveActions).toHaveLength(1)
  expect(archiveActions[0].content).toBeUndefined()
})

test(`${ActionType.ARCHIVE} keeps the reason when one is given`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
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

  const event = await client.event.actions.archive.request({
    ...generator.event.actions.archive(originalEvent.id),
    content: { reason: 'Duplicate of TEST123' }
  })

  const archiveActions = event.actions.flatMap((action) =>
    action.type === ActionType.ARCHIVE &&
    action.status === ActionStatus.Accepted
      ? [action]
      : []
  )

  expect(archiveActions).toHaveLength(1)
  expect(archiveActions[0].content).toEqual({ reason: 'Duplicate of TEST123' })
})

test(`${ActionType.ARCHIVE} action is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const declareInput = generator.event.actions.declare(originalEvent.id)

  await client.event.actions.declare.request(declareInput)
  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  const archivePayload = generator.event.actions.archive(originalEvent.id, {
    keepAssignment: true
  })

  const firstResponse =
    await client.event.actions.archive.request(archivePayload)
  const secondResponse =
    await client.event.actions.archive.request(archivePayload)

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
    mockActionApi(ActionType.ARCHIVE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.archive.request(
        generator.event.actions.archive(event.id, { keepAssignment: true })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfRejected is given', async () => {
    mockActionApi(ActionType.ARCHIVE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.archive.request(
        generator.event.actions.archive(event.id, {
          keepAssignmentIfRejected: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfAccepted is given', async () => {
    mockActionApi(ActionType.ARCHIVE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.archive.request(
        generator.event.actions.archive(event.id, {
          keepAssignmentIfAccepted: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Unassigns when integration responds with 202', async () => {
    mockActionApi(ActionType.ARCHIVE, 202)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    const response = await client.event.actions.archive.request(
      generator.event.actions.archive(event.id)
    )

    const lastAction = response.actions[response.actions.length - 1]

    expect(lastAction.type).toEqual(ActionType.UNASSIGN)
    expect(lastAction.status).toEqual(ActionStatus.Accepted)

    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['archive:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.DECLARED)
    expect(currentState.assignedTo).toEqual(undefined)
  })

  test('Keeps assignment when integration responds with 500', async () => {
    mockActionApi(ActionType.ARCHIVE, 500)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.archive.request(
        generator.event.actions.archive(event.id)
      )
    ).rejects.toThrow(
      'Unexpected failure from country config action confirmation API'
    )

    const eventAfterFailure = await client.event.get({ eventId: event.id })

    const currentState = getCurrentEventState(
      eventAfterFailure,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['archive:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.DECLARED)
    expect(currentState.assignedTo).toEqual(user.id)
  })
})
