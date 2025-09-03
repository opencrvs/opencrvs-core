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
import {
  ActionStatus,
  ActionType,
  AddressType,
  createPrng,
  EventStatus,
  EventIndex,
  generateActionDeclarationInput,
  getCurrentEventState,
  getUUID,
  NameFieldValue,
  SCOPES
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventWithDedupCheck
} from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

/* eslint-disable max-lines */

test(`prevents forbidden access if missing required scope`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.validate.request(
      generator.event.actions.validate('registered-event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_SUBMIT_FOR_APPROVAL])

  await expect(
    client.event.actions.validate.request(
      generator.event.actions.validate('registered-event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  /** Partial payload is accepted, so it should not complain about fields already send during declaration. */
  const data = generator.event.actions.validate(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'applicant.dobUnknown': false,
      'recommender.none': true
    }
  })

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await expect(
    client.event.actions.validate.request(data)
  ).rejects.matchSnapshot()
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const data = generator.event.actions.validate(event.id, {
    declaration: {
      'applicant.dob': '02-1-2024',
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
    client.event.actions.validate.request(data)
  ).rejects.matchSnapshot()
})

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

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

  const declaration = generator.event.actions.validate(event.id, {
    declaration: form
  })

  const response = await client.event.actions.validate.request(declaration)

  const savedAction = response.actions.find(
    (action) =>
      action.type === ActionType.VALIDATE &&
      action.status === ActionStatus.Accepted
  )

  expect(savedAction).toMatchObject({
    status: ActionStatus.Accepted,
    declaration: {}
  })
})

test('Prevents adding birth date in future', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

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

  await expect(
    client.event.actions.validate.request(
      generator.event.actions.validate(event.id, { declaration: form })
    )
  ).rejects.matchSnapshot()
})

test('validation prevents including hidden fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const data = generator.event.actions.validate(event.id, {
    declaration: {
      ...generateActionDeclarationInput(
        tennisClubMembershipEvent,
        ActionType.VALIDATE,
        () => 0.1
      ),
      'recommender.firstname': 'this should not be here'
    }
  })

  await expect(
    client.event.actions.validate.request(data)
  ).rejects.matchSnapshot()
})

test('valid action is appended to event actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await client.event.actions.validate.request(
    generator.event.actions.validate(event.id)
  )

  const updatedEvent = await client.event.get(event.id)

  expect(updatedEvent.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({
      type: ActionType.READ
    })
  ])
})

test(`${ActionType.VALIDATE} is idempotent`, async () => {
  const { user, generator, eventsDb } = await setupTestCase(100)
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const declarePayload = generator.event.actions.declare(event.id)
  await client.event.actions.declare.request(declarePayload)
  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
  )
  const validatePayload = generator.event.actions.validate(event.id, {
    keepAssignment: true
  })
  const firstResponse =
    await client.event.actions.validate.request(validatePayload)
  const databaseResultAfterFirst = await eventsDb.selectFrom('events').execute()
  const secondResponse =
    await client.event.actions.validate.request(validatePayload)
  const databaseResultAfterSecond = await eventsDb
    .selectFrom('events')
    .execute()
  expect(databaseResultAfterFirst).toEqual(databaseResultAfterSecond)
  expect(firstResponse).toEqual(secondResponse)
})

test('deduplication check is performed before validation when configured', async () => {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(ActionType.VALIDATE),
        { ...tennisClubMembershipEvent, id: 'tennis-club-membership_premium' }
      ])
    })
  )
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const existingEvent = await client.event.create(generator.event.create())
  const declaration = generateActionDeclarationInput(
    tennisClubMembershipEvent,
    ActionType.DECLARE,
    prng
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(existingEvent.id, {
      declaration
    })
  )

  const duplicateEvent = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(duplicateEvent.id, {
      declaration
    })
  )
  await client.event.actions.assignment.assign(
    generator.event.actions.assign(duplicateEvent.id, {
      assignedTo: user.id
    })
  )
  const stillDeclaredEvent = await client.event.actions.validate.request(
    generator.event.actions.validate(duplicateEvent.id, {
      declaration
    })
  )

  expect(
    getCurrentEventState(stillDeclaredEvent, tennisClubMembershipEvent)
  ).toMatchObject({
    status: 'DECLARED',
    potentialDuplicates: [existingEvent.id]
  } satisfies Partial<EventIndex>)
})

test('deduplication check is skipped if the event has been marked as not duplicate and data has not changed', async () => {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(
          ActionType.DECLARE,
          ActionType.VALIDATE
        ),
        { ...tennisClubMembershipEvent, id: 'tennis-club-membership_premium' }
      ])
    })
  )
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const existingEvent = await client.event.create(generator.event.create())
  const declaration = generateActionDeclarationInput(
    tennisClubMembershipEvent,
    ActionType.DECLARE,
    prng
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(existingEvent.id, {
      declaration
    })
  )

  const duplicateEvent = await client.event.create(generator.event.create())
  const declaredDuplicateEvent = await client.event.actions.declare.request(
    generator.event.actions.declare(duplicateEvent.id, {
      declaration
    })
  )

  expect(
    getCurrentEventState(declaredDuplicateEvent, tennisClubMembershipEvent)
      .potentialDuplicates
  ).toEqual([existingEvent.id])

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(duplicateEvent.id, {
      assignedTo: user.id
    })
  )
  await client.event.actions.duplicate.markNotDuplicate(
    generator.event.actions.duplicate.markNotDuplicate(duplicateEvent.id, {
      declaration,
      keepAssignment: true
    })
  )
  const validatedEvent = await client.event.actions.validate.request(
    generator.event.actions.validate(duplicateEvent.id, {
      declaration
    })
  )

  expect(
    getCurrentEventState(validatedEvent, tennisClubMembershipEvent)
  ).toMatchObject({
    status: 'VALIDATED',
    potentialDuplicates: []
  })
})

test('deduplication check is not skipped if the event has been marked as not duplicate but data has changed', async () => {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(
          ActionType.DECLARE,
          ActionType.VALIDATE
        ),
        { ...tennisClubMembershipEvent, id: 'tennis-club-membership_premium' }
      ])
    })
  )
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const existingEvent = await client.event.create(generator.event.create())
  const declaration = generateActionDeclarationInput(
    tennisClubMembershipEvent,
    ActionType.DECLARE,
    prng
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(existingEvent.id, {
      declaration
    })
  )

  const duplicateEvent = await client.event.create(generator.event.create())
  const declaredDuplicateEvent = await client.event.actions.declare.request(
    generator.event.actions.declare(duplicateEvent.id, {
      declaration
    })
  )

  expect(
    getCurrentEventState(declaredDuplicateEvent, tennisClubMembershipEvent)
      .potentialDuplicates
  ).toEqual([existingEvent.id])

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(duplicateEvent.id, {
      assignedTo: user.id
    })
  )
  await client.event.actions.duplicate.markNotDuplicate(
    generator.event.actions.duplicate.markNotDuplicate(duplicateEvent.id, {
      declaration,
      keepAssignment: true
    })
  )
  const previousName = declaration['applicant.name'] as NameFieldValue
  const stillDeclaredEvent = await client.event.actions.validate.request(
    generator.event.actions.validate(duplicateEvent.id, {
      declaration: {
        ...declaration,
        'applicant.name': {
          ...previousName,
          firstname: `${previousName.firstname}2`
        }
      }
    })
  )

  expect(
    getCurrentEventState(stillDeclaredEvent, tennisClubMembershipEvent)
  ).toMatchObject({
    status: 'DECLARED',
    potentialDuplicates: [existingEvent.id]
  })
})

test('Event status changes after validation action is accepted', async () => {
  const { user, generator } = await setupTestCase(100)
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  const declarePayload = generator.event.actions.declare(event.id)
  const eventAfterDeclareAction =
    await client.event.actions.declare.request(declarePayload)

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
  )
  const validatePayload = generator.event.actions.validate(event.id, {
    keepAssignment: true
  })
  const eventAfterValidatedAction =
    await client.event.actions.validate.request(validatePayload)

  const statusAfterDeclareAction = getCurrentEventState(
    eventAfterDeclareAction,
    tennisClubMembershipEvent
  ).status
  const statusAfterValidateAction = getCurrentEventState(
    eventAfterValidatedAction,
    tennisClubMembershipEvent
  ).status

  expect(eventAfterValidatedAction.actions).toStrictEqual([
    ...eventAfterDeclareAction.actions,
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Accepted
    })
  ])

  expect(statusAfterDeclareAction).toBe(EventStatus.Enum.DECLARED)
  expect(statusAfterValidateAction).toBe(EventStatus.Enum.VALIDATED)
})

test('Event status does not change if validation action is rejected', async () => {
  const { user, generator } = await setupTestCase(100)
  const client = createTestClient(user)
  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/validate`,
      () => {
        return HttpResponse.json(
          { error: 'Simulating rejection' },
          // @ts-expect-error - "For some reason the msw types here complain about the status, even though this is correct"
          { status: 400 }
        )
      }
    )
  )
  const event = await client.event.create(generator.event.create())
  const declarePayload = generator.event.actions.declare(event.id)
  const eventAfterDeclareAction =
    await client.event.actions.declare.request(declarePayload)

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
  )
  const validatePayload = generator.event.actions.validate(event.id, {
    keepAssignment: true
  })
  const eventAfterValidatedAction =
    await client.event.actions.validate.request(validatePayload)

  const statusAfterDeclareAction = getCurrentEventState(
    eventAfterDeclareAction,
    tennisClubMembershipEvent
  ).status
  const statusAfterValidateAction = getCurrentEventState(
    eventAfterValidatedAction,
    tennisClubMembershipEvent
  ).status

  expect(eventAfterValidatedAction.actions).toStrictEqual([
    ...eventAfterDeclareAction.actions,
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Rejected
    })
  ])

  expect(statusAfterDeclareAction).toBe(statusAfterValidateAction)
})
