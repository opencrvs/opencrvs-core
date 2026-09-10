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
import {
  ActionType,
  UUID,
  getUUID,
  getOrThrow,
  encodeScope,
  createPrng
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createSystemTestClient,
  createTestClient,
  seedEvent,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const ASSIGNED_ERROR = 'User is assigned to this event'

const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({ type: 'record.correct' })
])

describe('Reject correction action', () => {
  test('Prevents system requesting the action when it is assigned to a user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        keepAssignment: true,
        waitFor: false
      })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        waitFor: false,
        keepAssignment: true
      })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request({
        ...generator.event.actions.correction.request(event.id),
        keepAssignment: true,
        waitFor: false
      })

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    await expect(
      systemClient.event.actions.correction.reject.request({
        ...generator.event.actions.correction.reject(
          event.id,
          getOrThrow(correctionRequestAction?.id, 'action not found'),
          {}
        ),
        createdAtLocation: user.primaryOfficeId
      })
    ).rejects.toThrow(ASSIGNED_ERROR)
  })

  test('Allows system to request action when it is not assigned to user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        waitFor: false,
        keepAssignment: true
      })
    )
    await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        waitFor: false,
        keepAssignment: true
      })
    )

    const correctionRequestResponse =
      await client.event.actions.correction.request.request({
        ...generator.event.actions.correction.request(event.id),
        waitFor: false
      })

    const correctionRequestAction = correctionRequestResponse.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )

    await expect(
      systemClient.event.actions.correction.reject.request({
        ...generator.event.actions.correction.reject(
          event.id,
          getOrThrow(correctionRequestAction?.id, 'action not found'),
          {}
        ),
        createdAtLocation: user.primaryOfficeId
      })
    ).resolves.toBeDefined()
  })

  describe('with an already requested action', () => {
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

    let actionPayload: {
      eventId: UUID
      requestId: UUID
      transactionId: UUID
      content: { reason: string }
      actionId: UUID
    }

    beforeEach(async () => {
      mockActionApi(ActionType.REJECT_CORRECTION, 202)

      const { user, eventsDb, generator } = await setupTestCase()

      const { eventId, requestedActionIds } = await seedEvent(eventsDb, {
        actions: [
          ActionType.DECLARE,
          ActionType.REGISTER,
          ActionType.REQUEST_CORRECTION
        ],
        eventConfig: tennisClubMembershipEvent,
        user,
        rng: createPrng(12429)
      })

      const getRequestActionPayload = () => ({
        eventId,
        requestId: getOrThrow(
          requestedActionIds.REQUEST_CORRECTION,
          'no action id'
        ),
        transactionId: getUUID(),
        content: {
          reason: 'content'
        },
        waitFor: false
      })

      const client = createTestClient(user)
      const rejectActionResponse =
        await client.event.actions.correction.reject.request(
          getRequestActionPayload()
        )
      const rejectRequestAction = rejectActionResponse.actions.find(
        (a) => a.type === ActionType.REJECT_CORRECTION
      )

      await client.event.actions.assignment.assign(
        generator.event.actions.assign(eventId, {
          assignedTo: user.id,
          waitFor: false
        })
      )

      actionPayload = {
        ...getRequestActionPayload(),
        actionId: getOrThrow(rejectRequestAction?.id, 'no action id')
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.correction.reject.accept(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.correction.reject.reject(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
