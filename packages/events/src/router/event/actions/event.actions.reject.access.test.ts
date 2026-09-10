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
  encodeScope
} from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const ASSIGNED_ERROR = 'User is assigned to this event'
const FORBIDDEN_ERROR = 'FORBIDDEN'
const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({ type: 'record.reject' })
])

describe('Rejet action', () => {
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

    await expect(
      systemClient.event.actions.reject.request(
        generator.event.actions.reject(event.id)
      )
    ).rejects.toThrow(FORBIDDEN_ERROR)
  })

  test('Prevents system requesting the action when it is not assigned to user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { waitFor: false })
    )

    await expect(
      systemClient.event.actions.reject.request(
        generator.event.actions.reject(event.id)
      )
    ).rejects.toThrow(FORBIDDEN_ERROR)
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
      actionId: UUID
      transactionId: UUID
    }

    beforeEach(async () => {
      mockActionApi(ActionType.REJECT, 202)
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)

      const event = await client.event.create(generator.event.create())
      await client.event.actions.declare.request(
        generator.event.actions.declare(event.id, {
          keepAssignment: true,
          waitFor: false
        })
      )

      const rejectRequestResponse = await client.event.actions.reject.request(
        generator.event.actions.reject(event.id, { waitFor: false })
      )

      await expect(
        client.event.actions.assignment.assign(
          generator.event.actions.assign(event.id, {
            assignedTo: user.id,
            waitFor: false
          })
        )
      ).resolves.toBeDefined()

      const rejectRequestAction = rejectRequestResponse.actions.find(
        (a) => a.type === ActionType.REJECT
      )

      actionPayload = {
        eventId: event.id,
        actionId: getOrThrow(rejectRequestAction?.id, 'no action id'),
        transactionId: getUUID()
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.reject.accept({
          ...actionPayload,
          content: {
            reason: 'not good'
          }
        })
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.reject.reject(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
