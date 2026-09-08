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
  encodeScope,
  getOrThrow,
  getUUID
} from '@opencrvs/commons'
import {
  createEvent,
  createSystemTestClient,
  createTestClient,
  createCountryConfigClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const MOCK_REGISTRATION_NUMBER = '1MY2TEST3NRO'

const REGISTRAR_SCOPES = [
  encodeScope({ type: 'record.read' }),
  encodeScope({ type: 'record.create' }),
  encodeScope({ type: 'record.declare' }),
  encodeScope({ type: 'record.register' })
]

function mockAsyncRegisterApi() {
  return mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/REGISTER`,
      () => HttpResponse.json({}, { status: 202 })
    )
  )
}

/**
 * Requests a register action that the country config left pending, and returns
 * the requested action's id — the thing an accept call has to name.
 */
async function requestPendingRegistration() {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, REGISTRAR_SCOPES)
  const event = await createEvent(client, generator, [ActionType.DECLARE])

  mockAsyncRegisterApi()

  const input = generator.event.actions.register(event.id)
  const response = await client.event.actions.register.request(input)

  const actionId = getOrThrow(
    response.actions.find(
      (action) =>
        action.type === ActionType.REGISTER &&
        action.status === ActionStatus.Requested
    )?.id,
    'Could not find the requested register action'
  )

  return { user, generator, client, event, input, actionId }
}

describe('confirming an action requires more than the scope that requested it', () => {
  test('a registrar cannot accept their own pending registration with their own token', async () => {
    const { client, input, actionId } = await requestPendingRegistration()

    await expect(
      client.event.actions.register.accept({
        ...input,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  test('a registrar cannot reject their own pending registration with their own token', async () => {
    const { client, event, actionId } = await requestPendingRegistration()

    await expect(
      client.event.actions.register.reject({
        eventId: event.id,
        actionId,
        transactionId: getUUID()
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  test('the action-bound token core mints for country config can accept', async () => {
    const { user, event, input, actionId } = await requestPendingRegistration()

    const countryConfigClient = createCountryConfigClient(
      user,
      event.id,
      actionId
    )

    const response = await countryConfigClient.event.actions.register.accept({
      ...input,
      transactionId: getUUID(),
      actionId,
      registrationNumber: MOCK_REGISTRATION_NUMBER
    })

    expect(
      response.actions.find(
        (action) =>
          action.type === ActionType.REGISTER &&
          action.status === ActionStatus.Accepted
      )
    ).toMatchObject({ originalActionId: actionId })
  })

  test('a token bound to another action cannot accept this one', async () => {
    const { user, event, input, actionId } = await requestPendingRegistration()

    const clientBoundElsewhere = createCountryConfigClient(
      user,
      event.id,
      getUUID()
    )

    await expect(
      clientBoundElsewhere.event.actions.register.accept({
        ...input,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  test('an integration holding an unbound confirmation scope can accept', async () => {
    const { event, input, actionId } = await requestPendingRegistration()

    const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: 'record.action.accept' })
    ])

    const response = await systemClient.event.actions.register.accept({
      ...input,
      eventId: event.id,
      transactionId: getUUID(),
      actionId,
      registrationNumber: MOCK_REGISTRATION_NUMBER
    })

    expect(
      response.actions.find(
        (action) =>
          action.type === ActionType.REGISTER &&
          action.status === ActionStatus.Accepted
      )
    ).toMatchObject({ originalActionId: actionId })
  })

  test('the action scope alone no longer confirms, for an integration either', async () => {
    const { event, input, actionId } = await requestPendingRegistration()

    const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: 'record.register' })
    ])

    await expect(
      systemClient.event.actions.register.accept({
        ...input,
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  test('an unbound grant is still confined to its event types', async () => {
    const { event, input, actionId } = await requestPendingRegistration()

    const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({
        type: 'record.action.accept',
        options: { event: ['birth'] }
      })
    ])

    await expect(
      systemClient.event.actions.register.accept({
        ...input,
        eventId: event.id,
        transactionId: getUUID(),
        actionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('accept only confirms the pending action it names', () => {
  test('cannot be pointed at an action of another type', async () => {
    const { user, event, input } = await requestPendingRegistration()

    const createActionId = getOrThrow(
      event.actions.find((action) => action.type === ActionType.CREATE)?.id,
      'Could not find the create action'
    )

    const countryConfigClient = createCountryConfigClient(
      user,
      event.id,
      createActionId
    )

    await expect(
      countryConfigClient.event.actions.register.accept({
        ...input,
        transactionId: getUUID(),
        actionId: createActionId,
        registrationNumber: MOCK_REGISTRATION_NUMBER
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('cannot be pointed at an action that is not awaiting confirmation', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, REGISTRAR_SCOPES)
    const event = await createEvent(client, generator, [ActionType.DECLARE])

    const acceptedDeclareId = getOrThrow(
      event.actions.find(
        (action) =>
          action.type === ActionType.DECLARE &&
          action.status === ActionStatus.Accepted
      )?.id,
      'Could not find the accepted declare action'
    )

    const countryConfigClient = createCountryConfigClient(
      user,
      event.id,
      acceptedDeclareId
    )

    await expect(
      countryConfigClient.event.actions.declare.accept({
        ...generator.event.actions.declare(event.id),
        transactionId: getUUID(),
        actionId: acceptedDeclareId
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
})
