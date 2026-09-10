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
  encodeScope({ type: 'record.archive' })
])

describe('Archive action', () => {
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
      systemClient.event.actions.archive.request(
        generator.event.actions.archive(event.id)
      )
    ).rejects.toThrow(FORBIDDEN_ERROR)
  })

  test('Prevents system requesting the action when it is not assigned to user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    await expect(
      systemClient.event.actions.archive.request(
        generator.event.actions.archive(event.id)
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
      mockActionApi(ActionType.ARCHIVE, 202)
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)

      const event = await client.event.create(generator.event.create())
      await client.event.actions.declare.request(
        generator.event.actions.declare(event.id, {
          keepAssignment: true,
          waitFor: false
        })
      )

      const archiveRequestResponse = await client.event.actions.archive.request(
        generator.event.actions.archive(event.id)
      )

      await expect(
        client.event.actions.assignment.assign(
          generator.event.actions.assign(event.id, {
            assignedTo: user.id
          })
        )
      ).resolves.toBeDefined()

      const archiveRequestAction = archiveRequestResponse.actions.find(
        (a) => a.type === ActionType.ARCHIVE
      )

      actionPayload = {
        eventId: event.id,
        actionId: getOrThrow(archiveRequestAction?.id, 'no action id'),
        transactionId: getUUID()
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.archive.accept({
          ...actionPayload,
          content: {
            reason: 'not good'
          }
        })
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.archive.reject(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
