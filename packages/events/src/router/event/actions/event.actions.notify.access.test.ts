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

const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({ type: 'record.notify' })
])

describe('Notify action', () => {
  test('Prevents system requesting the action when it is assigned to a user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await expect(
      systemClient.event.actions.notify.request({
        ...generator.event.actions.notify(event.id),
        createdAtLocation: user.primaryOfficeId
      })
    ).rejects.toThrow(ASSIGNED_ERROR)
  })

  test('Allows system request the action when it is not assigned to user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await client.event.actions.assignment.unassign(
      generator.event.actions.unassign(event.id)
    )

    await expect(
      systemClient.event.actions.notify.request({
        ...generator.event.actions.notify(event.id),
        createdAtLocation: user.primaryOfficeId
      })
    ).resolves.toBeDefined()
  })

  describe('with an already requested action', () => {
    let action: { eventId: UUID; actionId: UUID; transactionId: UUID }

    beforeEach(async () => {
      const { user, eventsDb } = await setupTestCase()

      const { eventId, requestedActionIds } = await seedEvent(eventsDb, {
        actions: [{ type: ActionType.NOTIFY, status: ActionStatus.Requested }],
        eventConfig: tennisClubMembershipEvent,
        user,
        rng: createPrng(1259)
      })

      action = {
        eventId,
        actionId: getOrThrow(requestedActionIds.NOTIFY, 'no action id'),
        transactionId: getUUID()
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.notify.accept(action)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.notify.reject(action)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
