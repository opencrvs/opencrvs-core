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
  EventDocument,
  generateActionDeclarationInput,
  getAcceptedActions,
  getUUID,
  SCOPES
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test(`${ActionType.REQUEST_CORRECTION} prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.correction.request(
      generator.event.actions.correction.request(
        'registered-event-test-id-12345'
      )
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.REQUEST_CORRECTION} allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
  ])

  await expect(
    client.event.actions.correction.request(
      generator.event.actions.correction.request(
        'registered-event-test-id-12345'
      )
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.APPROVE_CORRECTION} prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.correction.approve(
      generator.event.actions.correction.approve(
        'registered-event-test-id-12345',
        'request-test-id-12345'
      )
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.APPROVE_CORRECTION} allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_REGISTRATION_CORRECT])

  await expect(
    client.event.actions.correction.approve(
      generator.event.actions.correction.approve(
        'registered-event-test-id-12345',
        'request-test-id-12345'
      )
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.REJECT_CORRECTION} prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.correction.reject(
      generator.event.actions.correction.reject(
        'registered-event-test-id-12345',
        'request-test-id-12345'
      )
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.REJECT_CORRECTION} allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_REGISTRATION_CORRECT])

  await expect(
    client.event.actions.correction.reject(
      generator.event.actions.correction.reject(
        'registered-event-test-id-12345',
        'request-test-id-12345'
      )
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('a correction request can be added to a created event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const declareInput = generator.event.actions.declare(originalEvent.id)

  await client.event.actions.declare.request(declareInput)
  const registeredEvent = await client.event.actions.register.request(
    generator.event.actions.register(originalEvent.id)
  )

  const withCorrectionRequest = await client.event.actions.correction.request(
    generator.event.actions.correction.request(registeredEvent.id)
  )

  expect(withCorrectionRequest.actions.slice(-2)).toEqual([
    expect.objectContaining({
      type: ActionType.REQUEST_CORRECTION
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test(`${ActionType.REQUEST_CORRECTION} validation error message contains all the offending fields`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.correction.request(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'applicant.dobUnknown': false,
      'recommender.none': true
    }
  })

  await expect(
    client.event.actions.correction.request(data)
  ).rejects.matchSnapshot()
})

test(`${ActionType.REQUEST_CORRECTION} when mandatory field is invalid, conditional hidden fields are still skipped`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.correction.request(event.id, {
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
    client.event.actions.correction.request(data)
  ).rejects.matchSnapshot()
})

test(`${ActionType.REQUEST_CORRECTION} Skips required field validation when they are conditionally hidden`, async () => {
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

  const data = generator.event.actions.correction.request(event.id, {
    declaration: form
  })

  const response = await client.event.actions.correction.request(data)
  const activeActions = getAcceptedActions(response)

  const savedAction = activeActions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )
  expect(savedAction?.declaration).toEqual(form)
})

test(`${ActionType.REQUEST_CORRECTION} Prevents adding birth date in future`, async () => {
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

  const payload = generator.event.actions.correction.request(event.id, {
    declaration: form
  })

  await expect(
    client.event.actions.correction.request(payload)
  ).rejects.matchSnapshot()
})

test('a correction request can be added to a created event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )
  const registeredEvent = await client.event.actions.register.request(
    generator.event.actions.register(originalEvent.id)
  )

  const withCorrectionRequest = await client.event.actions.correction.request(
    generator.event.actions.correction.request(registeredEvent.id)
  )

  expect(withCorrectionRequest.actions.slice(-2)).toEqual([
    expect.objectContaining({
      type: ActionType.REQUEST_CORRECTION
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

describe('when a correction request exists', () => {
  let withCorrectionRequest: EventDocument
  let client: ReturnType<typeof createTestClient>

  beforeEach(async () => {
    const { user, generator } = await setupTestCase()
    client = createTestClient(user)

    const originalEvent = await client.event.create(generator.event.create())

    const declareInput = generator.event.actions.declare(originalEvent.id)

    await client.event.actions.declare.request(declareInput)

    const registeredEvent = await client.event.actions.register.request(
      generator.event.actions.register(originalEvent.id)
    )

    withCorrectionRequest = await client.event.actions.correction.request(
      generator.event.actions.correction.request(registeredEvent.id, {
        declaration: {
          ...generateActionDeclarationInput(
            tennisClubMembershipEvent,
            ActionType.DECLARE
          ),
          'applicant.firstname': 'Johnny'
        }
      })
    )
  })

  test('a correction request can be approved with correct request id', async () => {
    const { generator } = await setupTestCase()

    const requestId =
      withCorrectionRequest.actions[withCorrectionRequest.actions.length - 1].id

    const withApprovedCorrectionRequest =
      await client.event.actions.correction.approve(
        generator.event.actions.correction.approve(
          withCorrectionRequest.id,
          requestId
        )
      )
    expect(withApprovedCorrectionRequest.actions.slice(-2)).toEqual([
      expect.objectContaining({
        type: ActionType.APPROVE_CORRECTION,
        requestId
      }),
      expect.objectContaining({ type: ActionType.UNASSIGN })
    ])
  })

  test('approving a request fails if request id is incorrect', async () => {
    const { generator } = await setupTestCase()

    const incorrectRequestId = getUUID()

    const request = client.event.actions.correction.approve(
      generator.event.actions.correction.approve(
        withCorrectionRequest.id,
        incorrectRequestId
      )
    )
    await expect(request).rejects.toThrow()
  })
})
