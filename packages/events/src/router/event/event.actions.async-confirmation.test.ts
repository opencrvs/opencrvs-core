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
import { ActionType, ActionStatus, getUUID } from '@opencrvs/commons'
import {
  createTestClient,
  createCountryConfigClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

function mockDeclareApi(status: number) {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/DECLARE`,
      () =>
        HttpResponse.json(
          {},
          // @ts-expect-error - msw types complain about numeric status
          { status }
        )
    )
  )
}

function getDeclareActionId(
  actions: { type: ActionType; status: ActionStatus; id: string }[]
) {
  const id = actions.find(
    (a) => a.type === ActionType.DECLARE && a.status === ActionStatus.Requested
  )?.id
  if (!id) {
    throw new Error('Declare action not found in actions list')
  }
  return id
}

describe('Async confirmation - keepAssignment flags on reject', () => {
  test('default: assignment dropped after async reject', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(202)

    const data = generator.event.actions.declare(event.id)
    const requestResponse = await client.event.actions.declare.request(data)

    const actionId = getDeclareActionId(requestResponse.actions)
    const ccClient = createCountryConfigClient(user, event.id, actionId)

    const response = await ccClient.event.actions.declare.reject({
      eventId: event.id,
      actionId,
      transactionId: getUUID()
    })

    expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignment=true: assignment kept after async reject', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(202)

    const data = generator.event.actions.declare(event.id)
    const requestResponse = await client.event.actions.declare.request(data)

    const actionId = getDeclareActionId(requestResponse.actions)
    const ccClient = createCountryConfigClient(user, event.id, actionId)

    const response = await ccClient.event.actions.declare.reject({
      eventId: event.id,
      actionId,
      transactionId: getUUID(),
      keepAssignment: true
    })

    expect(response.actions.at(-1)?.type).not.toEqual(ActionType.UNASSIGN)
  })
})

describe('Async confirmation - keepAssignment flags on accept', () => {
  test('default: assignment dropped after async accept', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(202)

    const data = generator.event.actions.declare(event.id)
    const requestResponse = await client.event.actions.declare.request(data)

    const actionId = getDeclareActionId(requestResponse.actions)
    const ccClient = createCountryConfigClient(user, event.id, actionId)

    const response = await ccClient.event.actions.declare.accept({
      ...data,
      actionId,
      transactionId: getUUID()
    })

    expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
  })

  test('keepAssignment=true: assignment kept after async accept', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    mockDeclareApi(202)

    const data = generator.event.actions.declare(event.id)
    const requestResponse = await client.event.actions.declare.request(data)

    const actionId = getDeclareActionId(requestResponse.actions)
    const ccClient = createCountryConfigClient(user, event.id, actionId)

    const response = await ccClient.event.actions.declare.accept({
      ...data,
      actionId,
      transactionId: getUUID(),
      keepAssignment: true
    })

    expect(response.actions.at(-1)?.type).not.toEqual(ActionType.UNASSIGN)
  })
})
