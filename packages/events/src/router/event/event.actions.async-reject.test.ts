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
  EventDocument,
  getOrThrow,
  getUUID
} from '@opencrvs/commons'
import {
  createEvent,
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const confirmer = createSystemTestClient(
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
)

function mockActionApi(action: ActionType, status: number) {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
      () => HttpResponse.json({}, { status })
    )
  )
}

function requestedActionId(event: EventDocument, type: ActionType) {
  return getOrThrow(
    event.actions.find(
      (action) =>
        action.type === type && action.status === ActionStatus.Requested
    )?.id,
    `Could not find a requested ${type} action`
  )
}

function rejectedAction(event: EventDocument, type: ActionType) {
  return getOrThrow(
    event.actions.find(
      (action) =>
        action.type === type && action.status === ActionStatus.Rejected
    ),
    `Could not find a rejected ${type} action`
  )
}

test('rejecting a pending REJECT keeps the reason of the requested action', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])
  const payload = generator.event.actions.reject(event.id)

  mockActionApi(ActionType.REJECT, 202)

  const requested = await client.event.actions.reject.request(payload)
  const actionId = requestedActionId(requested, ActionType.REJECT)

  const response = await confirmer.event.actions.reject.reject({
    eventId: event.id,
    transactionId: getUUID(),
    actionId
  })

  expect(rejectedAction(response, ActionType.REJECT)).toMatchObject({
    originalActionId: actionId,
    content: payload.content
  })
})

test('rejecting a pending APPROVE_CORRECTION keeps the correction request id', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REQUEST_CORRECTION
  ])

  const requestId = getOrThrow(
    event.actions.find(
      (action) =>
        action.type === ActionType.REQUEST_CORRECTION &&
        action.status === ActionStatus.Accepted
    )?.id,
    'Could not find an accepted REQUEST_CORRECTION action'
  )

  const payload = generator.event.actions.correction.approve(
    event.id,
    requestId
  )

  mockActionApi(ActionType.APPROVE_CORRECTION, 202)

  const requested =
    await client.event.actions.correction.approve.request(payload)
  const actionId = requestedActionId(requested, ActionType.APPROVE_CORRECTION)

  const response = await confirmer.event.actions.correction.approve.reject({
    eventId: event.id,
    transactionId: getUUID(),
    actionId
  })

  expect(rejectedAction(response, ActionType.APPROVE_CORRECTION)).toMatchObject(
    {
      originalActionId: actionId,
      requestId
    }
  )
})
