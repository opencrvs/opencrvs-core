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
import { createTestClient, setupTestCase } from '@events/tests/utils'

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

test('allows access with API scope with correct event type', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    'notify.event[event=birth-registration]'
  ])

  await expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.event.actions.notify.request({} as any)
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
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
})

test(`${ActionType.NOTIFY} is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_SUBMIT_INCOMPLETE,
    SCOPES.RECORD_DECLARE
  ])

  const event = await client.event.create(generator.event.create())

  const notifyPayload = generator.event.actions.notify(event.id)

  const firstResponse = await client.event.actions.notify.request(notifyPayload)
  const secondResponse =
    await client.event.actions.notify.request(notifyPayload)
  expect(firstResponse).toEqual(secondResponse)
})
