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

import { AddressType, EventStatus, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { TRPCError } from '@trpc/server'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.event.list()).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`allows access with required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_READ])

  await expect(client.event.list()).resolves.not.toThrow()
})

test('Returns empty list when no events', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const fetchedEvents = await client.event.list()

  expect(fetchedEvents).toEqual([])
})

test('Returns multiple events', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  for (let i = 0; i < 10; i++) {
    await client.event.create(generator.event.create())
  }

  const events = await client.event.list()

  expect(events).toHaveLength(10)
})

test('Returns aggregated event with updated status and values', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const initialDeclaration = {
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
      district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
      urbanOrRural: 'RURAL' as const,
      village: 'Small village'
    }
  }

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      declaration: initialDeclaration
    })
  )

  const initialEvents = await client.event.list()

  expect(initialEvents).toHaveLength(1)
  expect(initialEvents[0].status).toBe(EventStatus.DECLARED)
  expect(initialEvents[0].declaration).toEqual(initialDeclaration)

  const updatedDeclaration = {
    ...initialDeclaration,
    'applicant.firstname': 'Jane'
  }
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      declaration: updatedDeclaration
    })
  )

  const updatedEvents = await client.event.list()

  expect(updatedEvents).toHaveLength(1)

  expect(updatedEvents[0].status).toBe(EventStatus.DECLARED)
  expect(updatedEvents[0].declaration).toEqual(updatedDeclaration)
})
