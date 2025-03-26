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

import { createTestClient, setupTestCase } from '@events/tests/utils'
import { ActionType, SCOPES } from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { TRPCError } from '@trpc/server'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.event.get('event-test-id-12345')).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`allows access with required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_READ])

  await expect(client.event.get('some event')).rejects.not.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`Returns 404 when not found`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.get('id-not-persisted')
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Returns event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent.id).toEqual(event.id)

  const fetchedEventWithoutReadAction = fetchedEvent.actions.slice(0, -1)
  expect(fetchedEventWithoutReadAction).toEqual(event.actions)

  expect(fetchedEvent.actions[fetchedEvent.actions.length - 1]).toMatchObject({
    type: ActionType.READ
  })
})

test('Returns event with all actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare(generator.event.actions.declare(event.id))

  await client.event.actions.validate(
    generator.event.actions.validate(event.id)
  )

  await client.event.actions.reject(generator.event.actions.reject(event.id))
  await client.event.actions.archive(generator.event.actions.archive(event.id))

  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )

  await client.event.actions.printCertificate(
    generator.event.actions.printCertificate(event.id)
  )
  const correctionRequest = await client.event.actions.correction.request(
    generator.event.actions.correction.request(event.id)
  )

  await client.event.actions.correction.approve(
    generator.event.actions.correction.approve(
      correctionRequest.id,
      correctionRequest.actions[correctionRequest.actions.length - 1].id
    )
  )

  const fetchedEvent = await client.event.get(event.id)

  // should throw when test is not updated after updating fixture or something breaks.
  expect(fetchedEvent.actions).toHaveLength(
    tennisClubMembershipEvent.actions.length + 2 // CREATE and READ EVENT
  )

  const secondTimefetchedEvent = await client.event.get(event.id)
  expect(secondTimefetchedEvent.actions).toHaveLength(
    tennisClubMembershipEvent.actions.length + 3 // 1 CREATE and 2 READ EVENT
  )
})
