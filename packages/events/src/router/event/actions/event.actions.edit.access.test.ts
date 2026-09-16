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

import {
  ActionStatus,
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

const ASSIGNED_ERROR = 'User is assigned to this event'
const FORBIDDEN_ERROR = 'FORBIDDEN'
const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({ type: 'record.edit' })
])

describe('Edit action', () => {
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
      systemClient.event.actions.edit.request(
        generator.event.actions.edit(event.id)
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
      systemClient.event.actions.edit.request(
        generator.event.actions.edit(event.id)
      )
    ).rejects.toThrow(FORBIDDEN_ERROR)
  })

  describe('with an already requested action', () => {
    let actionPayload: { eventId: UUID; actionId: UUID; transactionId: UUID }

    beforeEach(async () => {
      const { user, eventsDb } = await setupTestCase()

      const { eventId, requestedActionIds } = await seedEvent(eventsDb, {
        actions: [
          ActionType.DECLARE,
          { type: ActionType.EDIT, status: ActionStatus.Requested }
        ],
        eventConfig: tennisClubMembershipEvent,
        user,
        rng: createPrng(1289)
      })

      actionPayload = {
        eventId,
        actionId: getOrThrow(requestedActionIds.EDIT, 'no action id'),
        transactionId: getUUID()
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.edit.accept(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.edit.reject(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
