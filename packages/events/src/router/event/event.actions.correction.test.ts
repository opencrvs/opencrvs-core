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
import { omit } from 'lodash'
import {
  ActionStatus,
  ActionType,
  AddressType,
  createPrng,
  EventDocument,
  generateActionDeclarationInput,
  getUUID,
  SCOPES
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

test(`${ActionType.REQUEST_CORRECTION} prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.correction.request.request(
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
    client.event.actions.correction.request.request(
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
    client.event.actions.correction.approve.request(
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
    client.event.actions.correction.approve.request(
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
    client.event.actions.correction.reject.request(
      generator.event.actions.correction.reject(
        'registered-event-test-id-12345',
        'request-test-id-12345',
        { reason: { message: 'No legal proof' } }
      )
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`${ActionType.REJECT_CORRECTION} allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_REGISTRATION_CORRECT])

  await expect(
    client.event.actions.correction.reject.request(
      generator.event.actions.correction.reject(
        'registered-event-test-id-12345',
        'request-test-id-12345',
        { reason: { message: 'No legal proof' } }
      )
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('a correction request can be added to a registered event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const withCorrectionRequest =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id)
    )

  expect(withCorrectionRequest.actions.slice(-3)).toEqual([
    expect.objectContaining({
      type: ActionType.REQUEST_CORRECTION,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.REQUEST_CORRECTION,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test(`${ActionType.REQUEST_CORRECTION} validation error message contains all the offending fields`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const data = generator.event.actions.correction.request(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'applicant.dobUnknown': false,
      'recommender.none': true
    }
  })

  await expect(
    client.event.actions.correction.request.request(data)
  ).rejects.matchSnapshot()
})

test(`${ActionType.REQUEST_CORRECTION} when mandatory field is invalid, conditional hidden fields are still skipped`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.correction.request(event.id, {
    declaration: {
      'applicant.dob': '02-1-2024', // Invalid date
      'applicant.dobUnknown': false,
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      },
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
    client.event.actions.correction.request.request(data)
  ).rejects.matchSnapshot()
})

test(`${ActionType.REQUEST_CORRECTION} Skips required field validation when they are conditionally hidden`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const form = {
    'applicant.dob': '2024-02-01',
    'applicant.dobUnknown': false,
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
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

  const response = await client.event.actions.correction.request.request(data)

  const savedAction = response.actions.find(
    ({ type, status }) =>
      type === ActionType.REQUEST_CORRECTION &&
      status === ActionStatus.Requested
  )

  expect(savedAction?.status).toEqual(ActionStatus.Requested)
  if (savedAction?.status === ActionStatus.Requested) {
    expect(savedAction.declaration).toEqual(form)
  }
})

test(`${ActionType.REQUEST_CORRECTION} Prevents adding birth date in future`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2040-02-01',
    'applicant.dobUnknown': false,
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
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
    client.event.actions.correction.request.request(payload)
  ).rejects.matchSnapshot()
})

test('REQUEST_CORRECTION prevents correcting a field which is configured as uncorrectable: true', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const payload = generator.event.actions.correction.request(event.id, {
    declaration: { 'applicant.email': 'john.doe@example.com' }
  })

  await expect(
    client.event.actions.correction.request.request(payload)
  ).rejects.matchSnapshot()
})

describe('when a correction request exists', () => {
  let withCorrectionRequest: EventDocument
  let client: ReturnType<typeof createTestClient>

  const rng = createPrng(94842)

  beforeEach(async () => {
    const { user, generator } = await setupTestCase()
    client = createTestClient(user)

    const event = await createEvent(client, generator, [
      ActionType.DECLARE,
      ActionType.VALIDATE,
      ActionType.REGISTER
    ])

    const declarationPayload = omit(
      {
        ...generateActionDeclarationInput(
          tennisClubMembershipEvent,
          ActionType.DECLARE,
          rng
        ),
        'applicant.name': {
          firstname: 'Johnny',
          surname: 'Doe'
        }
      },
      // Omit applicant.email, since it is configured as not correctable
      ['applicant.email', 'applicant.image']
    )

    withCorrectionRequest =
      await client.event.actions.correction.request.request(
        generator.event.actions.correction.request(event.id, {
          keepAssignment: true,
          declaration: declarationPayload
        })
      )
  })

  test('a correction request can be approved with correct request id', async () => {
    const { generator } = await setupTestCase()

    const requestId =
      withCorrectionRequest.actions[withCorrectionRequest.actions.length - 1].id

    const withApprovedCorrectionRequest =
      await client.event.actions.correction.approve.request(
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

    const request = client.event.actions.correction.approve.request(
      generator.event.actions.correction.approve(
        withCorrectionRequest.id,
        incorrectRequestId
      )
    )
    await expect(request).rejects.toThrow()
  })
})

test(`${ActionType.APPROVE_CORRECTION} is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const withCorrectionRequest =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id, {
        keepAssignment: true
      })
    )

  const actionId = withCorrectionRequest.actions.at(-1)?.id

  if (!actionId) {
    throw new Error('Request ID is undefined')
  }

  const approveCorrectionPayload = generator.event.actions.correction.approve(
    withCorrectionRequest.id,
    actionId,
    { keepAssignment: true }
  )

  const firstResponse = await client.event.actions.correction.approve.request(
    approveCorrectionPayload
  )
  const secondResponse = await client.event.actions.correction.approve.request(
    approveCorrectionPayload
  )

  expect(firstResponse).toEqual(secondResponse)
})

test(`${ActionType.REJECT_CORRECTION} is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const withCorrectionRequest =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id, {
        keepAssignment: true
      })
    )

  const actionId = withCorrectionRequest.actions.at(-1)?.id

  if (!actionId) {
    throw new Error('Request ID is undefined')
  }

  const rejectCorrectionPayload = generator.event.actions.correction.reject(
    withCorrectionRequest.id,
    actionId,
    {
      keepAssignment: true,
      reason: {
        message: 'no legal proof'
      }
    }
  )

  const firstResponse = await client.event.actions.correction.reject.request(
    rejectCorrectionPayload
  )
  const secondResponse = await client.event.actions.correction.reject.request(
    rejectCorrectionPayload
  )

  expect(firstResponse).toEqual(secondResponse)
})

test('a correction request is not allowed if the event is already waiting for correction', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  await client.event.actions.correction.request.request(
    generator.event.actions.correction.request(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await expect(
    client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id)
    )
  ).rejects.toThrow(
    new TRPCError({
      code: 'CONFLICT',
      message: 'Event is waiting for correction'
    })
  )
})
