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

import { http, HttpResponse } from 'msw'
import { Kysely } from 'kysely'
import {
  ActionType,
  UUID,
  getUUID,
  getOrThrow,
  ActionUpdate,
  ActionStatus,
  TokenUserType,
  TestUserRole,
  EventStatus,
  getCurrentEventState
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  CONFIRMATION_SCOPES,
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import AppSchema from '@events/storage/postgres/events/schema/app/AppSchema'

const systemClient = createSystemTestClient(TEST_SYSTEM_ID, CONFIRMATION_SCOPES)

describe('Declare async accept action', () => {
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

  let requestActionId: UUID
  let eventId: UUID
  let userId: UUID
  let dbClient: Kysely<AppSchema>
  beforeEach(async () => {
    mockActionApi(ActionType.DECLARE, 202)
    const { user, generator, eventsDb } = await setupTestCase()
    const client = createTestClient(user)
    userId = user.id
    dbClient = eventsDb

    const event = await client.event.create(generator.event.create())
    const declaredEvent = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        waitFor: false
      })
    )

    eventId = event.id
    requestActionId = getOrThrow(
      declaredEvent.actions.find((a) => a.type === ActionType.DECLARE)?.id,
      'no action id'
    )
  })

  test('Conditionally invisible field', async () => {
    const acceptDeclaration = {
      'declaration.hidden': 'test'
    }
    const acceptAnnotation = {
      'annotation.hidden': 'test2'
    }
    const response = await systemClient.event.actions.declare.accept({
      actionId: requestActionId,
      eventId,
      declaration: acceptDeclaration,
      annotation: acceptAnnotation,
      transactionId: getUUID(),
      waitFor: false
    })

    expect(response.actions).toHaveLength(5)

    expect(response.actions).toEqual([
      expect.objectContaining({ type: ActionType.CREATE }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Requested,
        createdByUserType: TokenUserType.enum.user,
        createdBy: userId,
        createdByRole: TestUserRole.enum.REGISTRATION_AGENT
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted,
        createdByUserType: TokenUserType.enum.system,
        originalActionId: response.actions[2].id,
        createdBy: TEST_SYSTEM_ID,
        declaration: acceptDeclaration,
        annotation: acceptAnnotation
      })
    ])

    const eventState = getCurrentEventState(response, tennisClubMembershipEvent)

    expect(eventState.declaration['declaration.hidden']).toEqual(
      acceptDeclaration['declaration.hidden']
    )
  })

  test('Allows accept without content', async () => {
    const response = await systemClient.event.actions.declare.accept({
      actionId: requestActionId,
      eventId,
      transactionId: getUUID(),
      waitFor: false
    })

    expect(response.actions).toHaveLength(5)

    expect(response.actions).toEqual([
      expect.objectContaining({ type: ActionType.CREATE }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Requested,
        createdByUserType: TokenUserType.enum.user,
        createdBy: userId,
        createdByRole: TestUserRole.enum.REGISTRATION_AGENT
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted,
        createdByUserType: TokenUserType.enum.system,
        originalActionId: response.actions[2].id,
        createdBy: TEST_SYSTEM_ID
      })
    ])

    const createRequestAction = response.actions[0]
    const declareRequestAction = response.actions[2]
    const declareAcceptAction = response.actions[4]

    const eventState = getCurrentEventState(response, tennisClubMembershipEvent)

    expect(eventState).toMatchObject({
      status: EventStatus.enum.DECLARED,
      legalStatuses: {
        DECLARED: {
          createdBy: declareRequestAction.createdBy,
          createdAt: declareRequestAction.createdAt,
          acceptedAt: declareAcceptAction.createdAt,
          createdAtLocation: declareRequestAction.createdAtLocation,
          createdByRole: TestUserRole.enum.REGISTRATION_AGENT,
          createdByUserType: TokenUserType.enum.user
        }
      },
      updatedAt: declareAcceptAction.createdAt,
      updatedBy: declareRequestAction.createdBy,
      updatedAtLocation: declareRequestAction.createdAtLocation,
      placeOfEvent: createRequestAction.createdAtLocation,
      // @ts-expect-error -- there are actions without declaration. We asserted this above.
      declaration: declareRequestAction.declaration
    })
  })

  test('Throws error when declaration includes properties outside the event configuration', async () => {
    await expect(
      systemClient.event.actions.declare.accept({
        actionId: requestActionId,
        eventId,
        declaration: {
          kissa: 'cat'
        },
        transactionId: getUUID()
      })
    ).rejects.toThrow(
      '[{"message":"Unexpected field","id":"kissa","value":"cat"}]'
    )

    const persistedActions = await dbClient
      .selectFrom('eventActions')
      .selectAll()
      .where('eventActions.eventId', '=', eventId)
      .orderBy('createdAt', 'asc')
      .execute()

    expect(persistedActions).toHaveLength(4)
    expect(persistedActions).toEqual([
      expect.objectContaining({ actionType: ActionType.CREATE }),
      expect.objectContaining({ actionType: ActionType.ASSIGN }),
      expect.objectContaining({
        actionType: ActionType.DECLARE,
        status: ActionStatus.Requested,
        createdByUserType: TokenUserType.enum.user,
        createdBy: userId,
        createdByRole: TestUserRole.enum.REGISTRATION_AGENT
      }),
      expect.objectContaining({ actionType: ActionType.UNASSIGN })
    ])
  })

  test('Declaration including hidden fields', async () => {
    const { generator } = await setupTestCase()

    const declarePayload = generator.event.actions.declare(eventId)

    await expect(
      systemClient.event.actions.declare.accept({
        ...declarePayload,
        actionId: requestActionId,
        declaration: {
          'applicant.dobUnknown': true,
          'applicant.age': 19,
          'applicant.dob': '2000-01-01'
        }
      })
    ).resolves.toBeDefined()

    const persistedActions = await dbClient
      .selectFrom('eventActions')
      .selectAll()
      .where('eventActions.eventId', '=', eventId)
      .orderBy('createdAt', 'asc')
      .execute()

    expect(persistedActions).toHaveLength(5)
    expect(persistedActions).toEqual([
      expect.objectContaining({ actionType: ActionType.CREATE }),
      expect.objectContaining({ actionType: ActionType.ASSIGN }),
      expect.objectContaining({
        actionType: ActionType.DECLARE,
        status: ActionStatus.Requested,
        createdByUserType: TokenUserType.enum.user,
        createdBy: userId,
        createdByRole: TestUserRole.enum.REGISTRATION_AGENT
      }),
      expect.objectContaining({ actionType: ActionType.UNASSIGN }),
      expect.objectContaining({
        actionType: ActionType.DECLARE,
        status: ActionStatus.Accepted,
        createdByUserType: TokenUserType.enum.system,
        createdBy: TEST_SYSTEM_ID,
        createdByRole: null
      })
    ])
  })
})

describe('Declare sync accept action', () => {
  function mockActionApi(
    action: ActionType,
    status: number,
    payload: ActionUpdate
  ) {
    return mswServer.use(
      http.post<never, { actionId: string }>(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
        () => {
          return HttpResponse.json(payload, { status })
        }
      )
    )
  }

  test('Allows accept without content', async () => {
    mockActionApi(ActionType.DECLARE, 200, {})
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())
    const response = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        waitFor: false
      })
    )

    expect(response.actions).toHaveLength(5)

    expect(response.actions).toEqual([
      expect.objectContaining({ type: ActionType.CREATE }),
      expect.objectContaining({ type: ActionType.ASSIGN }),
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Requested,
        createdByUserType: TokenUserType.enum.user,
        createdBy: user.id,
        createdByRole: TestUserRole.enum.REGISTRATION_AGENT
      }),
      // Immediate acceptance uses user details as values
      expect.objectContaining({
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted,
        createdByUserType: TokenUserType.enum.user,
        originalActionId: response.actions[2].id,
        createdBy: user.id
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN })
    ])

    const createRequestAction = response.actions[0]
    const declareRequestAction = response.actions[2]
    const declareAcceptAction = response.actions[3]

    const eventState = getCurrentEventState(response, tennisClubMembershipEvent)

    expect(eventState).toMatchObject({
      status: EventStatus.enum.DECLARED,
      legalStatuses: {
        DECLARED: {
          createdBy: declareRequestAction.createdBy,
          createdAt: declareRequestAction.createdAt,

          acceptedAt: declareAcceptAction.createdAt,
          createdAtLocation: declareRequestAction.createdAtLocation,
          createdByRole: TestUserRole.enum.REGISTRATION_AGENT,
          createdByUserType: TokenUserType.enum.user
        }
      },
      updatedAt: declareAcceptAction.createdAt,
      updatedBy: declareRequestAction.createdBy,
      updatedAtLocation: declareRequestAction.createdAtLocation,
      placeOfEvent: createRequestAction.createdAtLocation,
      // @ts-expect-error -- there are actions without declaration. We asserted this above.
      declaration: declareRequestAction.declaration
    })
  })

  test('Throws error when declaration includes properties outside the event configuration', async () => {
    mockActionApi(ActionType.DECLARE, 200, {
      declaration: {
        kissa: 'cat'
      }
    })

    const { user, generator, eventsDb } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())
    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(event.id, {
          waitFor: false
        })
      )
    ).rejects.toThrow(
      '[{"message":"Unexpected field","id":"kissa","value":"cat"}]'
    )

    const persistedActions = await eventsDb
      .selectFrom('eventActions')
      .selectAll()
      .where('eventActions.eventId', '=', event.id)
      .orderBy('createdAt', 'asc')
      .execute()

    expect(persistedActions).toHaveLength(3)
    expect(persistedActions).toEqual([
      expect.objectContaining({ actionType: ActionType.CREATE }),
      expect.objectContaining({ actionType: ActionType.ASSIGN }),
      expect.objectContaining({
        actionType: ActionType.DECLARE,
        status: ActionStatus.Requested,
        createdByUserType: TokenUserType.enum.user,
        createdBy: user.id,
        createdByRole: TestUserRole.enum.REGISTRATION_AGENT
      })
    ])
  })
})
