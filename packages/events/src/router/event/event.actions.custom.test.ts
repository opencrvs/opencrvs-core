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
import {
  sanitizeForSnapshot,
  setupTestCase,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'
import { createTestClient } from '@events/tests/utils'

const CUSTOM_ACTION_TYPE = 'CONFIRM'

async function initialiseTest(scopes: string[] = []) {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    `record.create[event=${TENNIS_CLUB_MEMBERSHIP}]`,
    ...scopes
  ])
  const event = await client.event.create(generator.event.create())

  const payload = {
    type: ActionType.CUSTOM,
    eventId: event.id,
    transactionId: getUUID(),
    customActionType: CUSTOM_ACTION_TYPE
  }

  return { client, payload }
}

describe('event.actions.custom', () => {
  describe('authorization', () => {
    test('prevents forbidden access if missing required scope', async () => {
      const { client, payload } = await initialiseTest()
      await expect(
        client.event.actions.custom.request(payload)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('prevents forbidden access if user has custom action scope but for wrong event type', async () => {
      const { client, payload } = await initialiseTest([
        `record.custom-action[event=foobar,customActionType=${CUSTOM_ACTION_TYPE}]`
      ])

      await expect(
        client.event.actions.custom.request(payload)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('prevents forbidden access if user has custom action scope but for wrong custom action type', async () => {
      const { client, payload } = await initialiseTest([
        `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP},customActionType=foobar]`
      ])

      await expect(
        client.event.actions.custom.request(payload)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('prevents forbidden access if user has two custom action scopes, but neither of them for correct event and action combination', async () => {
      const { client, payload } = await initialiseTest([
        `record.custom-action[event=random-event,customActionType=${CUSTOM_ACTION_TYPE}]`,
        `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP},customActionType=random-action]`
      ])

      await expect(
        client.event.actions.custom.request(payload)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('allows access if user has custom action scope for correct event type and custom action type', async () => {
      const { client, payload } = await initialiseTest([
        `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP},customActionType=${CUSTOM_ACTION_TYPE}]`
      ])

      await expect(
        client.event.actions.custom.request(payload)
      ).resolves.not.toThrow()
    })
  })

  test('returns HTTP400 if trying to execute an action not defined in countryconfig', async () => {
    const { client, payload } = await initialiseTest([
      `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP},customActionType=INVALID_ACTION]`
    ])

    await expect(
      client.event.actions.custom.request({
        ...payload,
        customActionType: 'INVALID_ACTION'
      })
    ).rejects.toMatchSnapshot()
  })

  test('successfully executes action', async () => {
    const { client, payload } = await initialiseTest([
      `record.custom-action[event=${TENNIS_CLUB_MEMBERSHIP},customActionType=${CUSTOM_ACTION_TYPE}]`
    ])

    await expect(
      client.event.actions.custom.request(payload)
    ).resolves.not.toThrow()

    const event = await client.event.get(payload.eventId)

    expect(sanitizeForSnapshot(event, UNSTABLE_EVENT_FIELDS)).toMatchSnapshot()
  })

  test.todo('ASYNC FLOW test cases')
})
