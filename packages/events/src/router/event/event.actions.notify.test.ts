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
import { ActionType, getAcceptedActions, SCOPES } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

describe('event.actions.notify', () => {
  describe('authorization', () => {
    test(`prevents forbidden access if missing required scope`, async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [])

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.event.actions.notify.request({} as any)
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test(`allows access if required scope is present`, async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [SCOPES.RECORD_SUBMIT_INCOMPLETE])

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.event.actions.notify.request({} as any)
      ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('disallows access with API scope with incorrect event type', async () => {
      const { user, generator } = await setupTestCase()
      const eventCreateClient = createTestClient(user, [
        'record.notify[event=TENNIS_CLUB_MEMBERSHIP]'
      ])

      const event = await eventCreateClient.event.create(
        generator.event.create()
      )

      const client = createTestClient(user, ['record.notify[event=some-event]'])

      await expect(
        client.event.actions.notify.request(
          generator.event.actions.notify(event.id)
        )
      ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })

    test('allows access with API scope with correct event type', async () => {
      const { user } = await setupTestCase()
      const client = createTestClient(user, [
        'record.notify[event=TENNIS_CLUB_MEMBERSHIP]'
      ])

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.event.actions.notify.request({} as any)
      ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
    })
  })

  test(`allows sending partial payload as ${ActionType.NOTIFY} action`, async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, [
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_DECLARE
    ])

    const event = await client.event.create(generator.event.create())

    const response = await client.event.actions.notify.request(
      generator.event.actions.notify(event.id)
    )

    const activeActions = getAcceptedActions(response)

    expect(
      activeActions.find((action) => action.type === ActionType.NOTIFY)
        ?.declaration
    ).toMatchSnapshot()

    expect(
      activeActions.find((action) => action.type === ActionType.UNASSIGN)
    ).toBeDefined()
  })

  test(`${ActionType.NOTIFY} is idempotent`, async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, [
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_DECLARE
    ])

    const event = await client.event.create(generator.event.create())

    const notifyPayload = generator.event.actions.notify(event.id)

    const firstResponse =
      await client.event.actions.notify.request(notifyPayload)
    const secondResponse =
      await client.event.actions.notify.request(notifyPayload)
    expect(firstResponse).toEqual(secondResponse)
  })

  describe('system user', () => {
    test('should not require assignment or create unassign action for system user', async () => {
      const { generator } = await setupTestCase()

      let client = createSystemTestClient('test-system', [
        'record.notify[event=TENNIS_CLUB_MEMBERSHIP]'
      ])

      const event = await client.event.create(generator.event.create())

      client = createSystemTestClient('test-system-2', [
        'record.notify[event=TENNIS_CLUB_MEMBERSHIP]'
      ])

      await client.event.actions.notify.request(
        generator.event.actions.notify(event.id)
      )

      const { user } = await setupTestCase()
      client = createTestClient(user)

      const fetchedEvent = await client.event.get(event.id)
      expect(fetchedEvent.actions.length).toEqual(3)
      expect(fetchedEvent.actions).toEqual([
        expect.objectContaining({ type: ActionType.CREATE }),
        expect.objectContaining({ type: ActionType.NOTIFY }),
        expect.objectContaining({ type: ActionType.READ })
      ])
    })
  })
})
