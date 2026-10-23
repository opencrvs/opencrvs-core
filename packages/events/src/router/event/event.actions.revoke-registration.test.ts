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
  getCurrentEventState,
  InherentFlags
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
    client.event.actions.revocation.revoke.request(
      generator.event.actions.revokeRegistration('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
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
    client.event.actions.revocation.revoke.request(
      generator.event.actions.revokeRegistration('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.REVOKE_REGISTRATION} moves a registered record to ${EventStatus.enum.REVOKED}`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const revokedEvent = await client.event.actions.revocation.revoke.request(
    generator.event.actions.revokeRegistration(event.id, {
      keepAssignment: true
    })
  )

  expect(
    getCurrentEventState(revokedEvent, tennisClubMembershipEvent).status
  ).toEqual(EventStatus.enum.REVOKED)
  expect(revokedEvent.actions.at(-1)).toMatchObject({
    type: ActionType.REVOKE_REGISTRATION
  })
})

test(`${ActionType.REVOKE_REGISTRATION} can not be performed on a declared, non-registered record`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [ActionType.DECLARE])

  await expect(
    client.event.actions.revocation.revoke.request(
      generator.event.actions.revokeRegistration(event.id)
    )
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining(
      `Action '${ActionType.REVOKE_REGISTRATION}' cannot be performed on an event in '${EventStatus.enum.DECLARED}' state`
    )
  })
})

test(`${ActionType.REVOKE_REGISTRATION} can not be performed while a correction is requested`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.REQUEST_CORRECTION
  ])

  await expect(
    client.event.actions.revocation.revoke.request(
      generator.event.actions.revokeRegistration(event.id)
    )
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringMatching(
      new RegExp(
        `'${EventStatus.enum.REGISTERED}' state with \\[.*${InherentFlags.CORRECTION_REQUESTED}`
      )
    )
  })
})

test(`record stays ${EventStatus.enum.REVOKED} when read and assignment actions follow the revoke`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await client.event.actions.revocation.revoke.request(
    generator.event.actions.revokeRegistration(event.id)
  )
  await client.event.get({ eventId: event.id })
  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event.id, { assignedTo: user.id })
  )
  await client.event.actions.assignment.unassign(
    generator.event.actions.unassign(event.id)
  )
  const latestEvent = await client.event.get({ eventId: event.id })

  const actionTypesAfterRevoke = latestEvent.actions
    .slice(
      latestEvent.actions.findIndex(
        ({ type }) => type === ActionType.REVOKE_REGISTRATION
      ) + 1
    )
    .map(({ type }) => type)

  expect(actionTypesAfterRevoke).toEqual(
    expect.arrayContaining([
      ActionType.READ,
      ActionType.ASSIGN,
      ActionType.UNASSIGN
    ])
  )
  expect(
    getCurrentEventState(latestEvent, tennisClubMembershipEvent).status
  ).toEqual(EventStatus.enum.REVOKED)
})

test(`${ActionType.REVOKE_REGISTRATION} can not be performed again on a revoked record`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await client.event.actions.revocation.revoke.request(
    generator.event.actions.revokeRegistration(event.id, {
      keepAssignment: true
    })
  )

  await expect(
    client.event.actions.revocation.revoke.request(
      generator.event.actions.revokeRegistration(event.id)
    )
  ).rejects.toMatchObject({
    code: 'CONFLICT',
    message: expect.stringContaining(
      `Action '${ActionType.REVOKE_REGISTRATION}' cannot be performed on an event in '${EventStatus.enum.REVOKED}' state`
    )
  })
})

test(`${ActionType.REVOKE_REGISTRATION} is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const revokePayload = generator.event.actions.revokeRegistration(event.id, {
    keepAssignment: true
  })

  const firstResponse =
    await client.event.actions.revocation.revoke.request(revokePayload)
  const secondResponse =
    await client.event.actions.revocation.revoke.request(revokePayload)

  expect(firstResponse).toEqual(secondResponse)
  expect(
    secondResponse.actions
      .filter(({ type }) => type === ActionType.REVOKE_REGISTRATION)
      .map(({ status }) => status)
  ).toEqual([ActionStatus.Requested, ActionStatus.Accepted])
})

describe.each([ConditionalType.SHOW, ConditionalType.ENABLE])(
  `${ActionType.REVOKE_REGISTRATION} with a %s conditional that is not met`,
  (conditionalType) => {
    test('is rejected and the record stays registered', async () => {
      mswServer.use(
        http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
          HttpResponse.json([
            {
              ...tennisClubMembershipEventWithCustomAction,
              actions: tennisClubMembershipEventWithCustomAction.actions.concat(
                [
                  {
                    type: ActionType.REVOKE_REGISTRATION,
                    label: {
                      id: 'event.tennis-club-membership.action.revoke.label',
                      defaultMessage: 'Revoke registration',
                      description: 'Label for the revoke registration action'
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
        ActionType.REGISTER
      ])

      await expect(
        client.event.actions.revocation.revoke.request(
          generator.event.actions.revokeRegistration(event.id)
        )
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        message: expect.stringContaining(
          `Conditions for action: ${ActionType.REVOKE_REGISTRATION} were not met`
        )
      })

      const latestEvent = await client.event.get({ eventId: event.id })
      expect(
        getCurrentEventState(latestEvent, tennisClubMembershipEvent).status
      ).toEqual(EventStatus.enum.REGISTERED)
    })
  }
)
