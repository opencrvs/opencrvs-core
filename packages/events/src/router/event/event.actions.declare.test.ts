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
import {
  ActionType,
  AddressType,
  generateActionDeclarationInput,
  getAcceptedActions,
  SCOPES
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test(`prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.declare.request(
      generator.event.actions.declare('event-test-id-12345', {})
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARE])

  await expect(
    client.event.actions.declare.request(
      generator.event.actions.declare('event-test-id-12345', {})
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.declare(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'applicant.dobUnknown': false,
      'recommender.none': true
    }
  })

  await expect(
    client.event.actions.declare.request(data)
  ).rejects.matchSnapshot()
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.declare(event.id, {
    declaration: {
      'applicant.dob': '02-1-2024',
      'applicant.dobUnknown': false,
      'applicant.firstname': 'John',
      'applicant.surname': 'Doe',
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
  })

  await expect(
    client.event.actions.declare.request(data)
  ).rejects.matchSnapshot()
})

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2024-02-01',
    'applicant.dobUnknown': false,
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
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

  const data = generator.event.actions.declare(event.id, {
    declaration: form
  })

  const response = await client.event.actions.declare.request(data)
  const activeActions = getAcceptedActions(response)

  const savedAction = activeActions.find(
    (action) => action.type === ActionType.DECLARE
  )
  expect(savedAction?.declaration).toEqual(form)
})

test('gives validation error when a conditional page, which is visible, has a required field', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    // When the applicant.dob is before 1950-01-01, the senior-pass.id field on senior-pass page is required
    'applicant.dob': '1944-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
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

  const data = generator.event.actions.declare(event.id, {
    declaration: form
  })

  await expect(
    client.event.actions.declare.request(data)
  ).rejects.matchSnapshot()
})

test('successfully validates a fields on a conditional page, which is visible', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    // When the applicant.dob is before 1950-01-01, the senior-pass.id field on senior-pass page is required
    'applicant.dob': '1944-02-01',
    'senior-pass.id': '1234567890',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
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

  const data = generator.event.actions.declare(event.id, {
    declaration: form
  })

  const response = await client.event.actions.declare.request(data)
  const activeActions = getAcceptedActions(response)

  const savedAction = activeActions.find(
    (action) => action.type === ActionType.DECLARE
  )
  expect(savedAction?.declaration).toEqual(form)
})

test('Prevents adding birth date in future', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2040-02-01',
    'applicant.dobUnknown': false,
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
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

  const payload = generator.event.actions.declare(event.id, {
    declaration: form
  })

  await expect(
    client.event.actions.declare.request(payload)
  ).rejects.matchSnapshot()
})

test('validation prevents including hidden fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.declare(event.id, {
    declaration: {
      ...generateActionDeclarationInput(
        tennisClubMembershipEvent,
        ActionType.DECLARE
      ),
      'recommender.firstname': 'this should not be here'
    }
  })

  await expect(
    client.event.actions.declare.request(data)
  ).rejects.matchSnapshot()
})

test('valid action is appended to event actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.declare(event.id)

  await client.event.actions.declare.request(data)
  const updatedEvent = await client.event.get(event.id)

  expect(updatedEvent.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.DECLARE
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({
      type: ActionType.READ
    })
  ])
})
