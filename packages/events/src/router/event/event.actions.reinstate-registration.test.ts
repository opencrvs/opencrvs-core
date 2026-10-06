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
  ConditionalType,
  encodeScope,
  never,
  EventStatus,
  getCurrentEventState
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import {
  mswServer,
  tennisClubMembershipEventWithCustomAction
} from '@events/tests/msw'
import { env } from '@events/environment'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.revocation.reinstate.request(
      generator.event.actions.reinstateRegistration('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.reinstate-registration',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    })
  ])

  await expect(
    client.event.actions.revocation.reinstate.request(
      generator.event.actions.reinstateRegistration('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`the revoke scope does not allow ${ActionType.REINSTATE_REGISTRATION}`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.revoke-registration',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    })
  ])

  await expect(
    client.event.actions.revocation.reinstate.request(
      generator.event.actions.reinstateRegistration('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.REINSTATE_REGISTRATION} moves a revoked record back to ${EventStatus.enum.REGISTERED}`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REVOKE_REGISTRATION
  ])

  const reinstatedEvent =
    await client.event.actions.revocation.reinstate.request(
      generator.event.actions.reinstateRegistration(event.id, {
        keepAssignment: true
      })
    )

  expect(
    getCurrentEventState(reinstatedEvent, tennisClubMembershipEvent).status
  ).toEqual(EventStatus.enum.REGISTERED)
  expect(reinstatedEvent.actions.at(-1)).toMatchObject({
    type: ActionType.REINSTATE_REGISTRATION
  })
})

test(`a reinstated record can be revoked again`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REVOKE_REGISTRATION,
    ActionType.REINSTATE_REGISTRATION
  ])

  const revokedAgain = await client.event.actions.revocation.revoke.request(
    generator.event.actions.revokeRegistration(event.id, {
      keepAssignment: true
    })
  )

  expect(
    getCurrentEventState(revokedAgain, tennisClubMembershipEvent).status
  ).toEqual(EventStatus.enum.REVOKED)
})

test(`${ActionType.REINSTATE_REGISTRATION} can not be performed on a record that is not revoked`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.revocation.reinstate.request(
      generator.event.actions.reinstateRegistration(event.id)
    )
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining(
      `Action '${ActionType.REINSTATE_REGISTRATION}' cannot be performed on an event in '${EventStatus.enum.REGISTERED}' state`
    )
  })
})

test(`${ActionType.PRINT_CERTIFICATE} can not be performed on a revoked record`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REVOKE_REGISTRATION
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id)
    )
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining(
      `Action '${ActionType.PRINT_CERTIFICATE}' cannot be performed on an event in '${EventStatus.enum.REVOKED}' state`
    )
  })
})

test(`${ActionType.REQUEST_CORRECTION} can not be performed on a revoked record`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REVOKE_REGISTRATION
  ])

  await expect(
    client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id)
    )
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining(
      `Action '${ActionType.REQUEST_CORRECTION}' cannot be performed on an event in '${EventStatus.enum.REVOKED}' state`
    )
  })
})

test(`${ActionType.REINSTATE_REGISTRATION} is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REVOKE_REGISTRATION
  ])

  const reinstatePayload = generator.event.actions.reinstateRegistration(
    event.id,
    { keepAssignment: true }
  )

  const firstResponse =
    await client.event.actions.revocation.reinstate.request(reinstatePayload)
  const secondResponse =
    await client.event.actions.revocation.reinstate.request(reinstatePayload)

  expect(firstResponse).toEqual(secondResponse)
  expect(
    secondResponse.actions
      .filter(({ type }) => type === ActionType.REINSTATE_REGISTRATION)
      .map(({ status }) => status)
  ).toEqual([ActionStatus.Requested, ActionStatus.Accepted])
})

describe.each([ConditionalType.SHOW, ConditionalType.ENABLE])(
  `${ActionType.REINSTATE_REGISTRATION} with a %s conditional that is not met`,
  (conditionalType) => {
    test('is rejected and the record stays revoked', async () => {
      mswServer.use(
        http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
          HttpResponse.json([
            {
              ...tennisClubMembershipEventWithCustomAction,
              actions: tennisClubMembershipEventWithCustomAction.actions.concat(
                [
                  {
                    type: ActionType.REINSTATE_REGISTRATION,
                    label: {
                      id: 'event.tennis-club-membership.action.reinstate.label',
                      defaultMessage: 'Reinstate registration',
                      description: 'Label for the reinstate registration action'
                    },
                    flags: [],
                    conditionals: [
                      { type: conditionalType, conditional: never() }
                    ]
                  }
                ]
              )
            }
          ])
        )
      )

      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)

      const event = await createEvent(client, generator, [
        ActionType.DECLARE,
        ActionType.REGISTER,
        ActionType.REVOKE_REGISTRATION
      ])

      await expect(
        client.event.actions.revocation.reinstate.request(
          generator.event.actions.reinstateRegistration(event.id)
        )
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: expect.stringContaining(
          `Conditions for action: ${ActionType.REINSTATE_REGISTRATION} were not met`
        )
      })

      const latestEvent = await client.event.get({ eventId: event.id })
      expect(
        getCurrentEventState(latestEvent, tennisClubMembershipEvent).status
      ).toEqual(EventStatus.enum.REVOKED)
    })
  }
)
