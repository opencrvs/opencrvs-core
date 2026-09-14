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
  ActionType,
  UUID,
  getUUID,
  getOrThrow,
  encodeScope,
  createPrng,
  ActionStatus
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

const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({ type: 'record.request-correction' })
])

describe('Request correction action', () => {
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

    await expect(
      systemClient.event.actions.correction.request.request({
        ...generator.event.actions.correction.request(event.id),
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
      generator.event.actions.register(event.id, { waitFor: false })
    )

    await expect(
      systemClient.event.actions.correction.request.request({
        ...generator.event.actions.correction.request(event.id),
        waitFor: false,
        createdAtLocation: user.primaryOfficeId
      })
    ).resolves.toBeDefined()
  })

  describe('with an already requested action', () => {
    let actionPayload: { eventId: UUID; actionId: UUID; transactionId: UUID }

    beforeEach(async () => {
      const { user, eventsDb } = await setupTestCase()

      const { eventId, requestedActionIds } = await seedEvent(eventsDb, {
        actions: [
          ActionType.DECLARE,
          ActionType.REGISTER,
          {
            type: ActionType.REQUEST_CORRECTION,
            status: ActionStatus.Requested
          }
        ],
        eventConfig: tennisClubMembershipEvent,
        user,
        rng: createPrng(1279)
      })

      const client = createTestClient(user)
      await client.event.actions.assignment.assign({
        type: ActionType.ASSIGN,
        eventId,
        assignedTo: user.id,
        transactionId: getUUID(),
        waitFor: false
      })
      actionPayload = {
        eventId,
        actionId: getOrThrow(
          requestedActionIds.REQUEST_CORRECTION,
          'no action id'
        ),
        transactionId: getUUID()
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.correction.request.accept(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.correction.request.reject(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
