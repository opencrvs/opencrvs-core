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
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { ActionType, SCOPES } from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'

const SCOPES_WITHOUT_UNASSIGN = TEST_USER_DEFAULT_SCOPES.filter(
  (scope) => scope != SCOPES.RECORD_UNASSIGN_OTHERS
)

describe(`Without scope: ${SCOPES.RECORD_UNASSIGN_OTHERS}`, () => {
  test(`If there is no ${ActionType.ASSIGN} action, should not throw error and should not add unassign action`, async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SCOPES_WITHOUT_UNASSIGN)

    const originalEvent = await client.event.create(generator.event.create())
    const response = await client.event.actions.assignment.unassign(
      generator.event.actions.unassign(originalEvent.id)
    )
    expect(response).toEqual(originalEvent)
  })

  test(`Can not unassign record that is assigned to someone else`, async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SCOPES_WITHOUT_UNASSIGN)
    const { user: user2 } = await setupTestCase()
    const client2 = createTestClient(user2, SCOPES_WITHOUT_UNASSIGN)
    const originalEvent = await client.event.create(generator.event.create())

    await client.event.actions.assignment.assign(
      generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
    )
    const response = client2.event.actions.assignment.unassign(
      generator.event.actions.unassign(originalEvent.id)
    )
    await expect(response).rejects.toMatchObject(
      new TRPCError({ code: 'FORBIDDEN' })
    )
  })

  describe(`If assigned to self`, () => {
    test.only(`If there is no ${ActionType.UNASSIGN} action after last ${ActionType.ASSIGN} action, should not throw error and should add unassign action`, async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, SCOPES_WITHOUT_UNASSIGN)
      const originalEvent = await client.event.create(generator.event.create())

      await client.event.actions.assignment.assign(
        generator.event.actions.assign(originalEvent.id, {
          assignedTo: user.id
        })
      )
      const response = await client.event.actions.assignment.unassign(
        generator.event.actions.unassign(originalEvent.id)
      )
      expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
    })

    test(`If there is ${ActionType.UNASSIGN} action after last ${ActionType.ASSIGN} action, should not throw error and should not add unassign action`, async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, SCOPES_WITHOUT_UNASSIGN)
      const originalEvent = await client.event.create(generator.event.create())

      await client.event.actions.assignment.assign(
        generator.event.actions.assign(originalEvent.id, {
          assignedTo: user.id
        })
      )
      const eventWithUnAssign = await client.event.actions.assignment.unassign(
        generator.event.actions.unassign(originalEvent.id)
      )

      const response = await client.event.actions.assignment.unassign(
        generator.event.actions.unassign(originalEvent.id)
      )
      expect(response).toEqual(eventWithUnAssign)
    })
  })
})

test(`Can unassign record that is assigned to someone else, if user has ${SCOPES.RECORD_UNASSIGN_OTHERS} scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, SCOPES_WITHOUT_UNASSIGN)
  const { user: user2 } = await setupTestCase()
  const client2 = createTestClient(user2)
  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, { assignedTo: user.id })
  )
  const response = await client2.event.actions.assignment.unassign(
    generator.event.actions.unassign(originalEvent.id)
  )

  expect(response.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)
})
