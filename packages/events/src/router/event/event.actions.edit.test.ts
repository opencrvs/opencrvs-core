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
  AddressType,
  getUUID,
  ActionUpdate,
  getCurrentEventState,
  EventStatus
} from '@opencrvs/commons'

import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.edit.request(
      generator.event.actions.edit('registered-event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('allows access if required scope is present', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.actions.edit.request(
      generator.event.actions.edit('registered-event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  /** Partial payload is accepted, so it should not complain about fields already send during declaration. */
  const data = generator.event.actions.edit(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'applicant.dobUnknown': false,
      'recommender.none': true
    }
  })

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await expect(client.event.actions.edit.request(data)).rejects.matchSnapshot()
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const data = generator.event.actions.edit(event.id, {
    declaration: {
      'applicant.dob': '02-1-2024',
      'applicant.dobUnknown': false,
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      },
      'recommender.none': true
    }
  })

  await expect(client.event.actions.edit.request(data)).rejects.matchSnapshot()
})

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const form = {
    'applicant.dob': '2024-02-01',
    'applicant.dobUnknown': false,
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      streetLevelDetails: {
        state: 'State',
        district2: 'District2'
      }
    }
  } satisfies ActionUpdate

  const declaration = generator.event.actions.edit(event.id, {
    declaration: form
  })

  const response = await client.event.actions.edit.request(declaration)

  const savedAction = response.actions.find(
    (action) =>
      action.type === ActionType.EDIT && action.status === ActionStatus.Accepted
  )

  expect(savedAction).toMatchObject({
    status: ActionStatus.Accepted,
    declaration: {}
  })
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
    mockActionApi(ActionType.EDIT, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.edit.request(
        generator.event.actions.edit(event.id, { keepAssignment: true })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfRejected is given', async () => {
    mockActionApi(ActionType.EDIT, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.edit.request(
        generator.event.actions.edit(event.id, {
          keepAssignmentIfRejected: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfAccepted is given', async () => {
    mockActionApi(ActionType.EDIT, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.edit.request(
        generator.event.actions.edit(event.id, {
          keepAssignmentIfAccepted: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Unassigns when integration responds with 202', async () => {
    mockActionApi(ActionType.EDIT, 202)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    const response = await client.event.actions.edit.request(
      generator.event.actions.edit(event.id)
    )

    const lastAction = response.actions[response.actions.length - 1]

    expect(lastAction.type).toEqual(ActionType.UNASSIGN)
    expect(lastAction.status).toEqual(ActionStatus.Accepted)

    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['edit:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.DECLARED)
    expect(currentState.assignedTo).toEqual(undefined)
  })

  test('Keeps assignment when integration responds with 500', async () => {
    mockActionApi(ActionType.EDIT, 500)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.edit.request(generator.event.actions.edit(event.id))
    ).rejects.toThrow(
      'Unexpected failure from country config action confirmation API'
    )

    const eventAfterFailure = await client.event.get({ eventId: event.id })

    const currentState = getCurrentEventState(
      eventAfterFailure,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['edit:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.DECLARED)
    expect(currentState.assignedTo).toEqual(user.id)
  })
})
