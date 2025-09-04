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
import { http, HttpResponse } from 'msw'
import { ActionType, generateUuid, SCOPES } from '@opencrvs/commons'
import { tennisClubMembershipEventWithDedupCheck } from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '../../tests/msw'
import { env } from '../../environment'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.getDuplicates({ eventId: generateUuid() })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('prevents forbidden access without assignment but with right scope', async () => {
  const { generator, users } = await setupTestCase()
  const someOtherClient = createTestClient(users[0])

  const myClient = createTestClient(users[1], [SCOPES.RECORD_REVIEW_DUPLICATES])

  const event = await someOtherClient.event.create(generator.event.create())
  await someOtherClient.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  await expect(
    myClient.event.getDuplicates({ eventId: event.id })
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Allows access with assignment and right scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    SCOPES.RECORD_REVIEW_DUPLICATES
  ])

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      keepAssignment: true
    })
  )

  await expect(
    client.event.getDuplicates({ eventId: event.id })
  ).resolves.toEqual([])
})

test('Returns single duplicate when found', async () => {
  const tennisClubMembershipWithDedupCheckConfig =
    tennisClubMembershipEventWithDedupCheck(ActionType.DECLARE)

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([tennisClubMembershipWithDedupCheckConfig])
    })
  )

  const { user, generator } = await setupTestCase(
    1881,
    tennisClubMembershipWithDedupCheckConfig
  )

  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    SCOPES.RECORD_REVIEW_DUPLICATES
  ])

  const event1 = await client.event.create(generator.event.create())
  const event1Payload = generator.event.actions.declare(event1.id)
  await client.event.actions.declare.request(event1Payload)

  const event2 = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: event1Payload.declaration
    })
  )

  await client.event.actions.assignment.assign({
    eventId: event2.id,
    assignedTo: user.id,
    transactionId: generateUuid()
  })

  await expect(
    client.event.getDuplicates({ eventId: event2.id })
  ).resolves.toHaveLength(1)

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event1.id, { assignedTo: user.id })
  )

  await expect(
    client.event.getDuplicates({ eventId: event1.id })
  ).resolves.toHaveLength(0)
})

test('Returns multiple duplicates when found', async () => {
  const tennisClubMembershipWithDedupCheckConfig =
    tennisClubMembershipEventWithDedupCheck(ActionType.DECLARE)

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([tennisClubMembershipWithDedupCheckConfig])
    })
  )

  const { user, generator } = await setupTestCase(
    1881,
    tennisClubMembershipWithDedupCheckConfig
  )

  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    SCOPES.RECORD_REVIEW_DUPLICATES
  ])

  const event1 = await client.event.create(generator.event.create())
  const event1Payload = generator.event.actions.declare(event1.id)
  await client.event.actions.declare.request(event1Payload)

  const event2 = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: event1Payload.declaration
    })
  )

  const event3 = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event3.id, {
      declaration: event1Payload.declaration
    })
  )

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event3.id, { assignedTo: user.id })
  )

  // Last item knows about all the previous ones
  await expect(
    client.event.getDuplicates({ eventId: event3.id })
  ).resolves.toHaveLength(2)

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event2.id, { assignedTo: user.id })
  )

  // Earlier items are not updated.
  await expect(
    client.event.getDuplicates({ eventId: event2.id })
  ).resolves.toHaveLength(1)

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event1.id, { assignedTo: user.id })
  )

  await expect(
    client.event.getDuplicates({ eventId: event1.id })
  ).resolves.toHaveLength(0)
})
