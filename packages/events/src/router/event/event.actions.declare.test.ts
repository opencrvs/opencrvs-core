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
import { TRPCError } from '@trpc/server'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.declare(
      generator.event.actions.declare('event-test-id-12345', {})
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARE_BIRTH])

  await expect(
    client.event.actions.declare(
      generator.event.actions.declare('event-test-id-12345', {})
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.declare(event.id, {
    data: {
      'applicant.dob': '02-02'
    }
  })

  await expect(client.event.actions.declare(data)).rejects.matchSnapshot()
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.declare(event.id, {
    data: {
      'applicant.dob': '02-1-2024',
      'applicant.firstname': 'John',
      'applicant.surname': 'Doe',
      'recommender.none': false
    }
  })

  await expect(client.event.actions.declare(data)).rejects.matchSnapshot()
})

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2024-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'recommender.none': false
  }

  const data = generator.event.actions.declare(event.id, {
    data: form
  })

  const response = await client.event.actions.declare(data)
  const savedAction = response.actions.find(
    (action) => action.type === ActionType.DECLARE
  )
  expect(savedAction?.data).toEqual(form)
})

test('Prevents adding birth date in future', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2040-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'recommender.none': false
  }

  const payload = generator.event.actions.declare(event.id, {
    data: form
  })

  await expect(client.event.actions.declare(payload)).rejects.matchSnapshot()
})
