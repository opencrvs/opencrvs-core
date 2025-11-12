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
import { ActionType, getUUID, TENNIS_CLUB_MEMBERSHIP } from '@opencrvs/commons'
import { setupTestCase } from '@events/tests/utils'
import { createTestClient } from '@events/tests/utils'

describe('event.actions.custom', () => {
  describe('authorization', () => {
    test('prevents forbidden access if missing required scope', async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [])

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.event.actions.custom.request({} as any)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('prevents forbidden access if user has custom action scope but for wrong event type', async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [
        'record.custom-action[event=foobar, customActionType=attest]'
      ])

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.event.actions.custom.request({} as any)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('prevents forbidden access if user has custom action scope but for wrong custom action type', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        `record.create[event=${TENNIS_CLUB_MEMBERSHIP}]`,
        `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP}, customActionType=foobar]`
      ])

      const event = await client.event.create(generator.event.create())

      const payload = {
        type: ActionType.CUSTOM,
        eventId: event.id,
        transactionId: getUUID(),
        customActionType: 'CONFIRM'
      }

      await expect(
        client.event.actions.custom.request(payload)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('allows access if user has custom action scope for correct event type and custom action type', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        `record.create[event=${TENNIS_CLUB_MEMBERSHIP}]`,
        `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP}, customActionType=CONFIRM]`
      ])

      const event = await client.event.create(generator.event.create())

      const payload = {
        type: ActionType.CUSTOM,
        eventId: event.id,
        transactionId: getUUID(),
        customActionType: 'CONFIRM'
      }

      await expect(
        client.event.actions.custom.request(payload)
      ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })
  })
})
