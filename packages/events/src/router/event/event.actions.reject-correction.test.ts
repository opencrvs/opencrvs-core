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

import { HttpResponse, http } from 'msw'
import {
  ActionStatus,
  ActionType,
  getCurrentEventState,
  EventStatus,
  getOrThrow
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

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
    mockActionApi(ActionType.REJECT_CORRECTION, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request(
        generator.event.actions.correction.request(event.id, {
          keepAssignment: true
        })
      )

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    await expect(
      client.event.actions.correction.reject.request(
        generator.event.actions.correction.reject(
          event.id,
          getOrThrow(correctionRequestAction?.id, 'No correction requested'),
          {
            keepAssignment: true
          }
        )
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfRejected is given', async () => {
    mockActionApi(ActionType.REJECT_CORRECTION, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request(
        generator.event.actions.correction.request(event.id, {
          keepAssignment: true
        })
      )

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    await expect(
      client.event.actions.correction.reject.request(
        generator.event.actions.correction.reject(
          event.id,
          getOrThrow(correctionRequestAction?.id, 'No correction requested'),
          {
            keepAssignmentIfRejected: true
          }
        )
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfAccepted is given', async () => {
    mockActionApi(ActionType.REJECT_CORRECTION, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request(
        generator.event.actions.correction.request(event.id, {
          keepAssignment: true
        })
      )

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    await expect(
      client.event.actions.correction.reject.request(
        generator.event.actions.correction.reject(
          event.id,
          getOrThrow(correctionRequestAction?.id, 'No correction requested'),
          {
            keepAssignmentIfAccepted: true
          }
        )
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Unassigns when integration responds with 202', async () => {
    mockActionApi(ActionType.REJECT_CORRECTION, 202)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request(
        generator.event.actions.correction.request(event.id, {
          keepAssignment: true
        })
      )

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    const response = await client.event.actions.correction.reject.request(
      generator.event.actions.correction.reject(
        event.id,
        getOrThrow(correctionRequestAction?.id, 'No correction requested'),
        {}
      )
    )

    const lastAction = response.actions[response.actions.length - 1]

    expect(lastAction.type).toEqual(ActionType.UNASSIGN)
    expect(lastAction.status).toEqual(ActionStatus.Accepted)

    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual([
      'reject_correction:requested',
      'correction-requested'
    ])
    expect(currentState.status).toEqual(EventStatus.enum.REGISTERED)
    expect(currentState.assignedTo).toEqual(undefined)
  })

  test('Keeps assignment when integration responds with 500', async () => {
    mockActionApi(ActionType.REJECT_CORRECTION, 500)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request(
        generator.event.actions.correction.request(event.id, {
          keepAssignment: true
        })
      )

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    await expect(
      client.event.actions.correction.reject.request(
        generator.event.actions.correction.reject(
          event.id,
          getOrThrow(correctionRequestAction?.id, 'No correction requested'),
          {}
        )
      )
    ).rejects.toThrow(
      'Unexpected failure from country config action confirmation API'
    )

    const eventAfterFailure = await client.event.get({ eventId: event.id })

    const currentState = getCurrentEventState(
      eventAfterFailure,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual([
      'reject_correction:requested',
      'correction-requested'
    ])
    expect(currentState.status).toEqual(EventStatus.enum.REGISTERED)
    expect(currentState.assignedTo).toEqual(user.id)
  })
})
