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
import { ActionType, SCOPES } from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'

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
  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    SCOPES.RECORD_SUBMIT_INCOMPLETE
  ])

  const event = await client.event.create(generator.event.create())
  await client.event.actions.notify.request(
    generator.event.actions.notify(event.id)
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  await client.event.actions.validate.request(
    generator.event.actions.validate(event.id)
  )

  await client.event.actions.reject.request(
    generator.event.actions.reject(event.id)
  )
  await client.event.actions.archive.request(
    generator.event.actions.archive(event.id)
  )

  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )

  await client.event.actions.printCertificate.request(
    generator.event.actions.printCertificate(event.id)
  )
  const correctionRequest = await client.event.actions.correction.request(
    generator.event.actions.correction.request(event.id)
  )

  await client.event.actions.correction.reject(
    generator.event.actions.correction.reject(
      event.id,
      correctionRequest.actions[correctionRequest.actions.length - 1].id
    )
  )

  await client.event.actions.correction.approve(
    generator.event.actions.correction.approve(
      correctionRequest.id,
      correctionRequest.actions[correctionRequest.actions.length - 1].id
    )
  )

  await client.event.get(event.id)
  const secondTimefetchedEvent = await client.event.get(event.id)

  expect(
    secondTimefetchedEvent.actions.filter(
      (action) => action.type === ActionType.READ
    )
  ).toHaveLength(2)
})
