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
import { ActionType, getUUID, getOrThrow, encodeScope } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const CUSTOM_ACTION_TYPE = 'CONFIRM_SENIOR_MEMBERSHIP'
const ASSIGNED_ERROR = 'User is assigned to this event'

const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({
    type: 'record.custom-action',
    options: {
      customActionTypes: [CUSTOM_ACTION_TYPE]
    }
  })
])

describe('Custom action', () => {
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

  const getCustomPayload = (eventId: string) => ({
    type: ActionType.CUSTOM,
    eventId,
    transactionId: getUUID(),
    customActionType: CUSTOM_ACTION_TYPE,
    annotation: {
      notes: 'Very custom indeed'
    }
  })

  const declarationOverrides = {
    // Use applicant.dob before 1950 to meet the condition for the custom action
    'applicant.dobUnknown': false,
    'applicant.age': undefined,
    'applicant.dob': '1949-05-10',
    'senior-pass.id': 'SP-123456',
    'senior-pass.recommender': false
  }

  test('Prevents system requesting the action when it is assigned to a user', async () => {
    const { user, generator } = await setupTestCase()

    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const declareInput = generator.event.actions.declare(event.id, {
      keepAssignment: true,
      waitFor: false
    })

    await client.event.actions.declare.request({
      ...declareInput,
      declaration: {
        ...declareInput.declaration,
        ...declarationOverrides
      }
    })

    await expect(
      systemClient.event.actions.custom.request(getCustomPayload(event.id))
    ).rejects.toThrow('User is assigned to this event')
  })

  test('Allows system request the action when it is not assigned to user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const declareInput = generator.event.actions.declare(event.id)

    await client.event.actions.declare.request({
      ...declareInput,
      declaration: {
        ...declareInput.declaration,
        ...declarationOverrides
      }
    })

    await expect(
      systemClient.event.actions.custom.request(getCustomPayload(event.id))
    ).resolves.toBeDefined()
  })

  describe('with an already requested action', () => {
    test('Prevents system accepting the action when it is assigned to a user', async () => {
      mockActionApi(ActionType.CUSTOM, 202)

      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        ...TEST_USER_DEFAULT_SCOPES,
        encodeScope({
          type: 'record.custom-action',
          options: {
            customActionTypes: [CUSTOM_ACTION_TYPE]
          }
        })
      ])

      const event = await client.event.create(generator.event.create())

      const declareInput = generator.event.actions.declare(event.id, {
        keepAssignment: true,
        waitFor: false
      })

      await client.event.actions.declare.request({
        ...declareInput,
        declaration: {
          ...declareInput.declaration,
          ...declarationOverrides
        }
      })

      const customRequestResponse = await client.event.actions.custom.request(
        getCustomPayload(event.id)
      )

      await expect(
        client.event.actions.assignment.assign(
          generator.event.actions.assign(event.id, {
            assignedTo: user.id
          })
        )
      ).resolves.toBeDefined()

      const customRequestAction = customRequestResponse.actions.find(
        (a) => a.type === ActionType.CUSTOM
      )

      await expect(
        systemClient.event.actions.custom.accept({
          ...getCustomPayload(event.id),
          actionId: getOrThrow(customRequestAction?.id, 'action id missing')
        })
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      mockActionApi(ActionType.CUSTOM, 202)

      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        ...TEST_USER_DEFAULT_SCOPES,
        encodeScope({
          type: 'record.custom-action',
          options: {
            customActionTypes: [CUSTOM_ACTION_TYPE]
          }
        })
      ])

      const event = await client.event.create(generator.event.create())

      const declareInput = generator.event.actions.declare(event.id, {
        keepAssignment: true,
        waitFor: false
      })

      await client.event.actions.declare.request({
        ...declareInput,
        declaration: {
          ...declareInput.declaration,
          ...declarationOverrides
        }
      })

      const customRequestResponse = await client.event.actions.custom.request(
        getCustomPayload(event.id)
      )

      await expect(
        client.event.actions.assignment.assign(
          generator.event.actions.assign(event.id, {
            assignedTo: user.id
          })
        )
      ).resolves.toBeDefined()

      const customRequestAction = customRequestResponse.actions.find(
        (a) => a.type === ActionType.CUSTOM
      )

      await expect(
        systemClient.event.actions.custom.reject({
          eventId: event.id,
          transactionId: getUUID(),
          actionId: getOrThrow(customRequestAction?.id, 'action id missing'),
          // @ts-expect-error -- No one has called this one? missing type?
          customActionType: CUSTOM_ACTION_TYPE
        })
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
