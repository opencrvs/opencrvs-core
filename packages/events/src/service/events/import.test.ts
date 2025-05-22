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
import { ActionType, generateEventDocument, SCOPES } from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.import(
      generateEventDocument({
        configuration: tennisClubMembershipEvent,
        actions: [ActionType.CREATE, ActionType.DECLARE]
      })
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('allows access with import scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_IMPORT])

  await expect(
    client.event.import(
      generateEventDocument({
        configuration: tennisClubMembershipEvent,
        actions: [ActionType.CREATE, ActionType.DECLARE]
      })
    )
  ).resolves.not.toThrow()
})

test('importing an event indexes it into Elasticsearch', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_IMPORT,
    SCOPES.RECORD_READ
  ])
  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE, ActionType.DECLARE]
  })

  await client.event.import(event)
  const events = await client.event.list()
  expect(events).toHaveLength(1)
  expect(events[0].id).toEqual(event.id)
})

test('importing the same event twice overwrites the previous one', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_IMPORT,
    SCOPES.RECORD_READ
  ])
  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE, ActionType.DECLARE]
  })

  await client.event.import(event)
  await client.event.import(event)
  const events = await client.event.list()
  expect(events).toHaveLength(1)
  expect(events[0].id).toEqual(event.id)
})
