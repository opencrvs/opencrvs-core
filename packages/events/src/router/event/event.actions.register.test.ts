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
import { HttpResponse, http } from 'msw'
import {
  ActionStatus,
  ActionType,
  ActionUpdate,
  AddressType,
  createPrng,
  EventDocument,
  encodeScope,
  EventIndex,
  generateActionDuplicateDeclarationInput,
  generateRegistrationNumber,
  getCurrentEventState,
  getOrThrow,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventWithDedupCheck
} from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  createCountryConfigClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES,
  createSystemTestClient
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { CreatedUser, payloadGenerator } from '@events/tests/generators'

/* eslint-disable max-lines */

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.register.request(
      generator.event.actions.register('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.register',
      options: { event: ['birth', 'death', 'tennis-club-membership'] }
    })
  ])

  await expect(
    client.event.actions.register.request(
      generator.event.actions.register('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('can not register an event that is not first declared and validated', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.register' })
  ])
  const event = await createEvent(client, generator, [])

  await expect(
    client.event.actions.register.request(
      generator.event.actions.register(event.id)
    )
  ).rejects.matchSnapshot()
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.register' })
  ])
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

  /** Partial payload is accepted, so it should not complain about fields already send during declaration. */
  const data = generator.event.actions.register(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'recommender.none': true,
      'applicant.dobUnknown': false,
      'applicant.age': null
    }
  })

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })
  await expect(
    client.event.actions.register.request(data)
  ).rejects.matchSnapshot()
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.register' })
  ])
  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.register(event.id, {
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
        administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
        streetLevelDetails: {
          state: 'State',
          district2: 'District2'
        }
      }
    }
  })

  await expect(
    client.event.actions.register.request(data)
  ).rejects.matchSnapshot()
})

const declaration = {
  'applicant.name': {
    firstname: 'John',
    surname: 'Doe'
  },
  'recommender.none': true,
  'applicant.address': {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
    streetLevelDetails: {
      state: 'State',
      district2: 'District2'
    }
  }
} satisfies ActionUpdate

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.register' })
  ])
  const { id: eventId } = await createEvent(client, generator, [
    ActionType.DECLARE
  ])

  const data = generator.event.actions.register(eventId)

  const response = await client.event.actions.register.request(data)

  const registerActions = response.actions.filter(
    (action) => action.type === ActionType.REGISTER
  )

  expect(registerActions).toEqual([
    expect.objectContaining({
      status: ActionStatus.Requested,
      declaration: data.declaration
    }),
    expect.objectContaining({
      status: ActionStatus.Accepted,
      declaration: {}
    })
  ])
})

test('Prevents adding birth date in future', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.register' })
  ])
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
      administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
      streetLevelDetails: {
        state: 'State',
        district2: 'District2'
      }
    }
  } satisfies ActionUpdate

  const payload = generator.event.actions.register(event.id, {
    declaration: form
  })

  await expect(
    client.event.actions.register.request(payload)
  ).rejects.matchSnapshot()
})

const MOCK_REGISTRATION_NUMBER = '1MY2TEST3NRO'

describe('Request and confirmation flow', () => {
  const prng = createPrng(1046)
  let registrationNumber: string

  function mockNotifyApi(status: number) {
    return mswServer.use(
      http.post<never, { actionId: string }>(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/REGISTER`,
        () => {
          registrationNumber = generateRegistrationNumber(prng)
          const responseBody = status === 200 ? { registrationNumber } : {}
          // @ts-expect-error - "For some reason the msw types here complain about the status, even though this is correct"
          return HttpResponse.json(responseBody, { status })
        }
      )
    )
  }

  test('should be able to successfully call action request multiple times, without creating duplicate request actions', async () => {
    const { user, generator } = await setupTestCase()

    const client = createTestClient(user, [
      encodeScope({ type: 'record.read' }),
      encodeScope({ type: 'record.create' }),
      encodeScope({ type: 'record.declare' }),
      encodeScope({ type: 'record.register' })
    ])
    const originalEvent = await createEvent(client, generator, [
      ActionType.DECLARE
    ])

    const { id: eventId } = originalEvent
    mockNotifyApi(200)

    const createAction = originalEvent.actions.filter(
      (action) => action.type === ActionType.CREATE
    )

    const assignmentInput = generator.event.actions.assign(originalEvent.id, {
      assignedTo: createAction[0].createdBy
    })

    await client.event.actions.assignment.assign(assignmentInput)

    const data = generator.event.actions.register(eventId, {
      declaration,
      keepAssignment: true
    })

    await client.event.actions.register.request(data)
    await client.event.actions.register.request(data)
    const event = await client.event.actions.register.request(data)

    const registerActions = event.actions.filter(
      (action) => action.type === ActionType.REGISTER
    )

    expect(registerActions).toEqual([
      expect.objectContaining({
        status: ActionStatus.Requested
      }),
      expect.objectContaining({
        status: ActionStatus.Accepted
      })
    ])
  })

  describe('Synchronous confirmation flow', () => {
    test('should mark action as accepted if notify API returns HTTP 200', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.register' })
      ])
      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      mockNotifyApi(200)

      const data = generator.event.actions.register(eventId)

      const response = await client.event.actions.register.request(data)
      const savedAction = response.actions.find(
        (action) =>
          action.type === ActionType.REGISTER &&
          action.status === ActionStatus.Accepted
      )

      expect(savedAction).toMatchObject({
        status: ActionStatus.Accepted,
        declaration: {},
        registrationNumber: registrationNumber
      })
    })

    test('should not save action if notify API returns invalid registration number', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.register' })
      ])
      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      mswServer.use(
        http.post(
          `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/REGISTER`,
          () => {
            return HttpResponse.json(
              { registrationNumber: 1234567890 }, // Registration number is not a string as it should be
              // @ts-expect-error - "For some reason the msw types here complain about the status, even though this is correct"
              { status: 200 }
            )
          }
        )
      )

      const data = generator.event.actions.register(eventId)

      await expect(
        client.event.actions.register.request(data)
      ).rejects.matchSnapshot()

      const event = await client.event.get({ eventId })
      const registerActions = event.actions.filter(
        (action) => action.type === ActionType.REGISTER
      )
      expect(registerActions).toEqual([
        expect.objectContaining({
          status: ActionStatus.Requested
        })
      ])
    })

    test('should mark action as rejected if notify API returns HTTP 400', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.register' })
      ])
      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      mockNotifyApi(400)

      const data = generator.event.actions.register(eventId, {
        declaration
      })

      const response = await client.event.actions.register.request(data)
      const registerActions = response.actions.filter(
        (action) => action.type === ActionType.REGISTER
      )

      expect(registerActions).toEqual([
        expect.objectContaining({
          status: ActionStatus.Requested
        }),
        expect.objectContaining({
          status: ActionStatus.Rejected
        })
      ])
    })

    test(`should not save ${ActionStatus.Accepted} / ${ActionStatus.Rejected} action if notify API returns HTTP 500`, async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.register' })
      ])

      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      mockNotifyApi(500)

      await expect(
        client.event.actions.register.request(
          generator.event.actions.register(eventId)
        )
      ).rejects.matchSnapshot()

      const registeredEvent = await client.event.get({ eventId })

      const registerActions = registeredEvent.actions.filter(
        (action) => action.type === ActionType.REGISTER
      )
      expect(registerActions).toEqual([
        expect.objectContaining({
          status: ActionStatus.Requested
        })
      ])
    })
  })

  describe('Asynchronous confirmation flow', () => {
    test('should save action in requested state if notify API returns HTTP 202', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: 'record.read' }),
        encodeScope({ type: 'record.create' }),
        encodeScope({ type: 'record.declare' }),
        encodeScope({ type: 'record.register' })
      ])

      const event = await createEvent(client, generator, [ActionType.DECLARE])

      mockNotifyApi(202)

      const registerInput = generator.event.actions.register(event.id)

      const response =
        await client.event.actions.register.request(registerInput)

      const savedAction = response.actions.find(
        (action) => action.type === ActionType.REGISTER
      )

      expect(savedAction).toMatchObject({
        status: ActionStatus.Requested,
        declaration: registerInput.declaration
      })
    })

    describe('Accepting', () => {
      test('should not be able to accept the action if action is not first requested', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.read' }),
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])
        const event = await createEvent(client, generator, [ActionType.DECLARE])

        mockNotifyApi(202)

        const data = generator.event.actions.register(event.id, {
          declaration
        })

        const allegedActionId = getUUID()

        const countryConfigClient = createCountryConfigClient(
          user,
          event.id,
          allegedActionId
        )

        await expect(
          countryConfigClient.event.actions.register.accept({
            ...data,
            actionId: allegedActionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })
        ).rejects.matchSnapshot()
      })

      test('should not be able to accept action if action is already rejected', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.read' }),
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )

        await client.event.actions.assignment.assign(assignmentInput)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        await countryConfigClient.event.actions.register.reject({
          eventId,
          actionId: originalActionId,
          transactionId: getUUID()
        })

        await client.event.actions.assignment.assign({
          ...assignmentInput,
          transactionId: getUUID()
        })

        await expect(
          countryConfigClient.event.actions.register.accept({
            ...data,
            actionId: originalActionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })
        ).rejects.matchSnapshot()
      })

      test('should successfully accept a previously requested action', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )
        await client.event.actions.assignment.assign(assignmentInput)

        await client.event.actions.register.request(data)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        const response =
          await countryConfigClient.event.actions.register.accept({
            ...data,
            transactionId: getUUID(),
            actionId: originalActionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })

        const registerActions = response.actions.filter(
          (action) =>
            action.type === ActionType.REGISTER &&
            action.status !== ActionStatus.Rejected
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1]).toMatchObject({
          status: ActionStatus.Accepted,
          declaration: data.declaration,
          registrationNumber: MOCK_REGISTRATION_NUMBER,
          originalActionId: originalActionId
        })
      })

      test('should be able to call accept multiple times, without creating duplicate accept actions', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.read' }),
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])
        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )

        await client.event.actions.assignment.assign(assignmentInput)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        await countryConfigClient.event.actions.register.accept({
          ...data,
          transactionId: getUUID(),
          actionId: originalActionId,
          registrationNumber: MOCK_REGISTRATION_NUMBER
        })

        await client.event.actions.assignment.assign({
          ...assignmentInput,
          transactionId: getUUID()
        })
        const response =
          await countryConfigClient.event.actions.register.accept({
            ...data,
            transactionId: getUUID(),
            actionId: originalActionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })

        const registerActions = response.actions.filter(
          (action) =>
            action.type === ActionType.REGISTER &&
            action.status !== ActionStatus.Rejected
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1]).toMatchObject({
          declaration: data.declaration,
          status: ActionStatus.Accepted
        })
      })
      test.todo('should be able to edit the event data while accept action')

      test('allows accepting a registration request with the same exchanged event and action id', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )
        await client.event.actions.assignment.assign(assignmentInput)

        await client.event.actions.register.request(data)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        const response =
          await countryConfigClient.event.actions.register.accept({
            ...data,
            transactionId: getUUID(),
            actionId: originalActionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })

        const registerActions = response.actions.filter(
          (action) =>
            action.type === ActionType.REGISTER &&
            action.status !== ActionStatus.Rejected
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1]).toMatchObject({
          status: ActionStatus.Accepted,
          declaration: data.declaration,
          registrationNumber: MOCK_REGISTRATION_NUMBER,
          originalActionId: originalActionId
        })
      })

      test('does not allow accepting a registration request with different exchanged event and action id', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )
        await client.event.actions.assignment.assign(assignmentInput)

        await client.event.actions.register.request(data)

        const countryConfigClient = createCountryConfigClient(
          user,
          'cafecafe-cafe-4caf-8afe-cafecafecafe',
          'abbaabba-abba-4abb-8baa-abbaabbaabba'
        )

        await expect(
          countryConfigClient.event.actions.register.accept({
            ...data,
            transactionId: getUUID(),
            actionId: originalActionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })
        ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
      })
    })

    describe('Rejecting', () => {
      test('should not be able to reject the action if action is not first requested', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])
        const event = await createEvent(client, generator, [ActionType.DECLARE])

        mockNotifyApi(202)

        const data = generator.event.actions.register(event.id, {
          declaration
        })

        const allegedActionId = getUUID()

        const countryConfigClient = createCountryConfigClient(
          user,
          event.id,
          allegedActionId
        )

        await expect(
          countryConfigClient.event.actions.register.reject({
            ...data,
            actionId: allegedActionId
          })
        ).rejects.matchSnapshot()
      })

      test('should not be able to reject the action if action is already accepted', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])
        const event = await createEvent(client, generator, [ActionType.DECLARE])
        const eventId = event.id

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const createAction = event.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(event.id, {
          assignedTo: createAction[0].createdBy
        })

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        await client.event.actions.assignment.assign(assignmentInput)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        await countryConfigClient.event.actions.register.accept({
          ...data,
          actionId: originalActionId,
          transactionId: getUUID(),
          registrationNumber: MOCK_REGISTRATION_NUMBER
        })

        await client.event.actions.assignment.assign({
          ...assignmentInput,
          transactionId: getUUID()
        })
        await expect(
          countryConfigClient.event.actions.register.reject({
            ...data,
            actionId: originalActionId
          })
        ).rejects.matchSnapshot()
      })

      test('should be able to call reject multiple times, without creating duplicate reject actions', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])
        const event = await createEvent(client, generator, [ActionType.DECLARE])

        const { id: eventId } = event

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId, {
          declaration
        })

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = event.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(event.id, {
          assignedTo: createAction[0].createdBy
        })

        await client.event.actions.assignment.assign(assignmentInput)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        await countryConfigClient.event.actions.register.reject({
          eventId,
          transactionId: getUUID(),
          actionId: originalActionId
        })

        await client.event.actions.assignment.assign({
          ...assignmentInput,
          transactionId: getUUID()
        })
        const response =
          await countryConfigClient.event.actions.register.reject({
            eventId,
            transactionId: getUUID(),
            actionId: originalActionId
          })

        const registerActions = response.actions.filter(
          (action) => action.type === ActionType.REGISTER
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1].status).toEqual(ActionStatus.Rejected)
      })

      test('should successfully reject a previously requested action', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.read' }),
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])
        const event = await createEvent(client, generator, [ActionType.DECLARE])

        const { id: eventId } = event
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = event.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(event.id, {
          assignedTo: createAction[0].createdBy
        })

        await client.event.actions.assignment.assign(assignmentInput)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        const response =
          await countryConfigClient.event.actions.register.reject({
            eventId,
            transactionId: getUUID(),
            actionId: originalActionId
          })

        const registerActions = response.actions.filter(
          (action) => action.type === ActionType.REGISTER
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1]).toMatchObject({
          status: ActionStatus.Rejected,
          originalActionId
        })
      })

      test('allows rejecting a registration request with the same exchanged event and action id', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.read' }),
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )
        await client.event.actions.assignment.assign(assignmentInput)

        await client.event.actions.register.request(data)

        const countryConfigClient = createCountryConfigClient(
          user,
          eventId,
          originalActionId
        )

        const response =
          await countryConfigClient.event.actions.register.reject({
            eventId,
            transactionId: getUUID(),
            actionId: originalActionId
          })

        const registerActions = response.actions.filter(
          (action) => action.type === ActionType.REGISTER
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1]).toMatchObject({
          status: ActionStatus.Rejected,
          originalActionId
        })
      })

      test('does not allow rejecting a registration request with different exchanged event and action id', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user, [
          encodeScope({ type: 'record.read' }),
          encodeScope({ type: 'record.create' }),
          encodeScope({ type: 'record.declare' }),
          encodeScope({ type: 'record.register' })
        ])

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE
        ])

        const { id: eventId } = originalEvent
        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId)

        const registerResponse =
          await client.event.actions.register.request(data)

        const originalActionId = getOrThrow(
          registerResponse.actions.find(
            (action) => action.type === ActionType.REGISTER
          )?.id,
          'Could not find register action for id'
        )

        const createAction = originalEvent.actions.filter(
          (action) => action.type === ActionType.CREATE
        )

        const assignmentInput = generator.event.actions.assign(
          originalEvent.id,
          {
            assignedTo: createAction[0].createdBy
          }
        )
        await client.event.actions.assignment.assign(assignmentInput)

        await client.event.actions.register.request(data)

        const countryConfigClient = createCountryConfigClient(
          user,
          'cafecafe-cafe-4caf-8afe-cafecafecafe',
          'abbaabba-abba-4abb-8baa-abbaabbaabba'
        )

        await expect(
          countryConfigClient.event.actions.register.reject({
            eventId,
            transactionId: getUUID(),
            actionId: originalActionId
          })
        ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
      })
    })
  })
})

test('deduplication check is performed before register when configured', async () => {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(ActionType.REGISTER)
      ])
    })
  )
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.declare' }),
    encodeScope({ type: 'record.register' })
  ])

  const existingEvent = await client.event.create(generator.event.create())
  const declarationPayload = generateActionDuplicateDeclarationInput(
    tennisClubMembershipEvent,
    ActionType.DECLARE,
    prng
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(existingEvent.id, {
      declaration: declarationPayload
    })
  )

  const duplicateEvent = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(duplicateEvent.id, {
      declaration: declarationPayload
    })
  )
  await client.event.actions.assignment.assign(
    generator.event.actions.assign(duplicateEvent.id, {
      assignedTo: user.id
    })
  )
  const stillValidated = await client.event.actions.register.request(
    generator.event.actions.register(duplicateEvent.id, {
      declaration: declarationPayload
    })
  )

  expect(
    getCurrentEventState(stillValidated, tennisClubMembershipEvent)
  ).toMatchObject({
    status: 'DECLARED',
    potentialDuplicates: [
      { id: existingEvent.id, trackingId: existingEvent.trackingId }
    ]
  } satisfies Partial<EventIndex>)
})

function getRequestedRegisterAction(response: EventDocument) {
  const requestedAction = response.actions.find(
    ({ type, status }: { type: ActionType; status: ActionStatus }) =>
      type === ActionType.REGISTER && status === ActionStatus.Requested
  )

  expect(requestedAction?.status).toEqual(ActionStatus.Requested)

  return requestedAction
}

describe('Register action - hidden field nullification', () => {
  let user: CreatedUser
  let generator: ReturnType<typeof payloadGenerator>

  beforeEach(async () => {
    const testCase = await setupTestCase()
    user = testCase.user
    generator = testCase.generator
  })

  describe('Invalid keys scenarios', () => {
    test('rejects hidden field with non-null value during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const declaredDocument = await client.event.get({ eventId: event.id })
      const declaredCurrentEventState = getCurrentEventState(
        declaredDocument,
        tennisClubMembershipEvent
      )
      expect(declaredCurrentEventState.declaration).toHaveProperty(
        'recommender.none',
        true
      )
      expect(declaredCurrentEventState.declaration).not.toHaveProperty(
        'recommender.name'
      )
      expect(declaredCurrentEventState.declaration).not.toHaveProperty(
        'recommender.id'
      )
      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.dobUnknown': true,
          'applicant.age': 19,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // recommender.name is HIDDEN when recommender.none = true
          // Sending a VALUE for hidden field should fail
          'recommender.name': {
            firstname: 'Jane',
            surname: 'Smith'
          },
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      await expect(
        client.event.actions.register.request(payload)
      ).rejects.toMatchSnapshot()
    })

    test('rejects multiple hidden fields with non-null values during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const declaredDocument = await client.event.get({ eventId: event.id })
      const declaredCurrentEventState = getCurrentEventState(
        declaredDocument,
        tennisClubMembershipEvent
      )
      expect(declaredCurrentEventState.declaration).toHaveProperty(
        'recommender.none',
        true
      )
      expect(declaredCurrentEventState.declaration).not.toHaveProperty(
        'recommender.name'
      )
      expect(declaredCurrentEventState.declaration).not.toHaveProperty(
        'recommender.id'
      )

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.dobUnknown': true,
          'applicant.age': 19,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Both fields are HIDDEN when recommender.none = true
          'recommender.name': {
            firstname: 'Jane',
            surname: 'Smith'
          },
          'recommender.id': '1234',
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.INTERNATIONAL,
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const error = await client.event.actions.register
        .request(payload)
        .catch((err) => err)
      expect(error).toBeInstanceOf(TRPCError)
      expect(error.code).toBe('BAD_REQUEST')
      // Should mention both offending fields
      expect(error.message).toContain('recommender.name')
      expect(error.message).toContain('recommender.id')
    })

    test('rejects non-existent field during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.dobUnknown': true,
          'applicant.age': 19,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Field does not exist in form config
          'nonexistent.field': null,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      await expect(
        client.event.actions.register.request(payload)
      ).rejects.toMatchSnapshot()
    })

    test('rejects hidden field from conditional page during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          // DOB after 1950 means senior-pass page is HIDDEN
          'applicant.dob': '2000-02-01',
          'applicant.dobUnknown': false,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // senior-pass.id is on a hidden page
          'senior-pass.id': '1234567890',
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      await expect(
        client.event.actions.register.request(payload)
      ).rejects.toMatchSnapshot()
    })
  })

  describe('Valid keys scenarios', () => {
    test('accepts hidden field with null value during registration (intentional clearing)', async () => {
      const client = createTestClient(user, [
        ...TEST_USER_DEFAULT_SCOPES,
        encodeScope({
          type: 'record.search',
          options: { event: ['tennis-club-membership'], placeOfEvent: 'administrativeArea' }
        })
      ])
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.age': 19,
          'applicant.dobUnknown': true,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Explicitly setting hidden field to null is allowed
          'recommender.name': null,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const response = await client.event.actions.register.request(payload)

      const requestedAction = getRequestedRegisterAction(response)
      if (requestedAction?.status === ActionStatus.Requested) {
        // The null value should be included in the declaration
        expect(requestedAction.declaration).toHaveProperty(
          'recommender.name',
          null
        )
      }

      const { results: fetchedEvents } = await client.event.search({
        query: {
          type: 'and',
          clauses: [
            {
              eventType: TENNIS_CLUB_MEMBERSHIP,
              data: {
                'applicant.name': { type: 'fuzzy', term: 'John' }
              }
            }
          ]
        }
      })

      expect(fetchedEvents).toHaveLength(1)
      expect(fetchedEvents[0].declaration).not.toHaveProperty(
        'recommender.name'
      )
      expect(fetchedEvents[0].declaration).not.toHaveProperty('recommender.id')
      expect(fetchedEvents[0].declaration).toHaveProperty(
        'recommender.none',
        true
      )
      expect(fetchedEvents[0].declaration).toHaveProperty('applicant.name', {
        firstname: 'John',
        surname: 'Doe'
      })

      const currentEventState = getCurrentEventState(
        response,
        tennisClubMembershipEvent
      )
      expect(currentEventState.declaration).not.toHaveProperty(
        'recommender.name'
      )
      expect(currentEventState.declaration).not.toHaveProperty('recommender.id')
      expect(currentEventState.declaration).toHaveProperty(
        'recommender.none',
        true
      )
    })

    test('accepts multiple hidden fields with null values during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.age': 19,
          'applicant.dobUnknown': true,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Multiple hidden fields explicitly set to null
          'recommender.name': null,
          'recommender.id': null,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const response = await client.event.actions.register.request(payload)

      const requestedAction = getRequestedRegisterAction(response)
      if (requestedAction?.status === ActionStatus.Requested) {
        expect(requestedAction.declaration).toHaveProperty(
          'recommender.name',
          null
        )
        expect(requestedAction.declaration).toHaveProperty(
          'recommender.id',
          null
        )
      }
    })

    test('accepts visible field with any value during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.age': 19,
          'applicant.dobUnknown': true,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          // When recommender.none = false, recommender.name is VISIBLE
          'recommender.none': false,
          'recommender.id': '1234',
          'recommender.name': {
            firstname: 'Jane',
            surname: 'Smith'
          },
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const response = await client.event.actions.register.request(payload)

      const requestedAction = getRequestedRegisterAction(response)
      if (requestedAction?.status === ActionStatus.Requested) {
        expect(requestedAction.declaration).toHaveProperty('recommender.name', {
          firstname: 'Jane',
          surname: 'Smith'
        })
      }
    })

    test('accepts field from conditional page when page is visible during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [])

      const payload = generator.event.actions.declare(event.id, {
        declaration: {
          // DOB before 1950 makes senior-pass page VISIBLE
          'applicant.dob': '1944-02-01',
          'applicant.dobUnknown': false,
          'applicant.age': null,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // senior-pass.id is now on a visible page
          'senior-pass.id': '1234567890',
          'senior-pass.recommender': true,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        },
        keepAssignment: true
      })
      // Step 1: Declare with recommender.none = false (recommender.name is visible)
      await client.event.actions.declare.request(payload)

      // Step 2: Register with the same values - senior-pass.id and senior-pass.recommender as null
      const registerPayload = generator.event.actions.register(event.id, {
        declaration: {
          ...declaration,
          // DOB after 1950 makes senior-pass page HIDDEN
          'applicant.dob': '2000-02-01',
          'senior-pass.id': null, // Explicitly clear the hidden field
          'senior-pass.recommender': null // Explicitly clear the hidden field
        }
      })
      const registerResponse =
        await client.event.actions.register.request(registerPayload)

      const currentEventState = getCurrentEventState(
        registerResponse,
        tennisClubMembershipEvent
      )
      expect(currentEventState.declaration).not.toHaveProperty('senior-pass.id')
      expect(currentEventState.declaration).not.toHaveProperty(
        'senior-pass.recommender'
      )
    })

    test('omits hidden field when not provided during registration (default behavior)', async () => {
      const client = createTestClient(user, [
        ...TEST_USER_DEFAULT_SCOPES,
        encodeScope({
          type: 'record.search',
          options: { event: ['tennis-club-membership'], placeOfEvent: 'administrativeArea' }
        })
      ])
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.age': 19,
          'applicant.dobUnknown': true,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // recommender.name is hidden and NOT provided (omitted)
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const response = await client.event.actions.register.request(payload)

      const requestedAction = getRequestedRegisterAction(response)
      if (requestedAction?.status === ActionStatus.Requested) {
        // Hidden field should not be in the declaration at all
        expect(requestedAction.declaration).not.toHaveProperty(
          'recommender.name'
        )
      }

      const { results: fetchedEvents } = await client.event.search({
        query: {
          type: 'and',
          clauses: [
            {
              eventType: TENNIS_CLUB_MEMBERSHIP,
              data: {
                'applicant.name': { type: 'fuzzy', term: 'John' }
              }
            }
          ]
        }
      })

      expect(fetchedEvents).toHaveLength(1)
      expect(fetchedEvents[0].declaration).not.toHaveProperty(
        'recommender.name'
      )
      expect(fetchedEvents[0].declaration).not.toHaveProperty('recommender.id')
      expect(fetchedEvents[0].declaration).toHaveProperty(
        'recommender.none',
        true
      )
      expect(fetchedEvents[0].declaration).toHaveProperty('applicant.name', {
        firstname: 'John',
        surname: 'Doe'
      })

      const currentEventState = getCurrentEventState(
        response,
        tennisClubMembershipEvent
      )
      expect(currentEventState.declaration).not.toHaveProperty(
        'recommender.name'
      )
      expect(currentEventState.declaration).not.toHaveProperty('recommender.id')
      expect(currentEventState.declaration).toHaveProperty(
        'recommender.none',
        true
      )
    })
  })

  describe('Edge cases', () => {
    test('accepts null for hidden field on hidden page during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          // DOB after 1950 means senior-pass page is HIDDEN
          'applicant.dob': '2000-02-01',
          'applicant.dobUnknown': false,
          'applicant.age': null,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Explicitly clearing field on hidden page
          'senior-pass.id': null,
          'recommender.name': null,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const response = await client.event.actions.register.request(payload)
      const requestedAction = getRequestedRegisterAction(response)
      if (requestedAction?.status === ActionStatus.Requested) {
        expect(requestedAction.declaration).toHaveProperty(
          'senior-pass.id',
          null
        )
      }
    })

    test('mixed valid and invalid keys returns only invalid keys in error during registration', async () => {
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [
        ActionType.DECLARE
      ])

      const payload = generator.event.actions.register(event.id, {
        declaration: {
          'applicant.age': 19, // ✅ Valid
          'applicant.dobUnknown': false, // ✅ trued
          'applicant.name': {
            // ✅ Valid
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true, // ✅ Valid
          'recommender.name': {
            // ❌ Invalid: hidden field with value
            firstname: 'Jane',
            surname: 'Smith'
          },
          'applicant.address': {
            // ✅ Valid
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        }
      })

      const error = await client.event.actions.register
        .request(payload)
        .catch((e) => e)

      expect(error).toBeInstanceOf(TRPCError)
      expect(error.code).toBe('BAD_REQUEST')
      // Should only mention invalid keys
      expect(error.message).toContain('recommender.name')
      // Should NOT mention valid keys
      expect(error.message).not.toContain('applicant.dob')
      expect(error.message).not.toContain('applicant.name')
    })

    test('nullifying hidden field during registration after it was declared with a value', async () => {
      const client = createTestClient(user)
      const event = await client.event.create(generator.event.create())

      const payload = generator.event.actions.declare(event.id, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': false,
          'recommender.id': '1234',
          'recommender.name': {
            firstname: 'Jane',
            surname: 'Smith'
          },
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'State',
              district2: 'District2'
            }
          }
        },
        keepAssignment: true
      })

      // Step 1: Declare with recommender.none = false (recommender.name is visible)
      await client.event.actions.declare.request(payload)

      // Step 2: Register with recommender.none = true (recommender.name becomes hidden)
      // Explicitly nullify the previously declared recommender.name
      const registerPayload = generator.event.actions.register(event.id, {
        declaration: {
          ...declaration,
          'recommender.none': true,
          'recommender.name': null, // Explicitly clear the hidden field
          'recommender.id': null // Explicitly clear the hidden field
        }
      })

      const response =
        await client.event.actions.register.request(registerPayload)

      const requestedAction = getRequestedRegisterAction(response)
      if (requestedAction?.status === ActionStatus.Requested) {
        expect(requestedAction.declaration).toHaveProperty(
          'recommender.name',
          null
        )
      }

      // Verify the current event state no longer has recommender.name
      const currentState = getCurrentEventState(
        response,
        tennisClubMembershipEvent
      )
      expect(currentState.declaration['recommender.name']).toBeUndefined()
    })
  })
})

describe('Registration by different user with declaration changes', () => {
  let user: CreatedUser
  let generator: ReturnType<typeof payloadGenerator>

  beforeEach(async () => {
    const testCase = await setupTestCase()
    user = testCase.user
    generator = testCase.generator
  })

  test('registration agent declares with senior-pass page visible, registrar nullifies hidden page field when page becomes hidden', async () => {
    // Registration agent with limited scopes
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    // Regular client with full permissions
    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    const payload = {
      declaration: {
        'applicant.dob': '1944-02-01', // Makes senior-pass page visible
        'applicant.dobUnknown': false,
        'applicant.age': null,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': true,
        'senior-pass.id': '1234567890', // Field on visible page
        'senior-pass.recommender': true,
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    // Step 2: Registration agent declares with senior-pass page VISIBLE (dob < 1950)
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Assign the event to registrar for registration
    const assignmentInput = generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
    await registrarClient.event.actions.assignment.assign(assignmentInput)

    // Step 4: Registrar changes dob to make senior-pass page HIDDEN and nullifies the field
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'applicant.dob': '2000-02-01', // Makes senior-pass page hidden
        'senior-pass.id': null, // Explicitly nullify hidden page field
        'senior-pass.recommender': null
      }
    })

    const response =
      await registrarClient.event.actions.register.request(registerPayload)

    const requestedAction = getRequestedRegisterAction(response)
    if (requestedAction?.status === ActionStatus.Requested) {
      expect(requestedAction.declaration).toHaveProperty('senior-pass.id', null)
      expect(requestedAction.declaration).toHaveProperty(
        'senior-pass.recommender',
        null
      )
    }

    // Verify current event state no longer has senior-pass fields
    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )
    expect(currentState.declaration['senior-pass.id']).toBeUndefined()
    expect(currentState.declaration['senior-pass.recommender']).toBeUndefined()
    expect(currentState.declaration['applicant.dob']).toBe('2000-02-01')
  })

  test('registration agent declares with recommender details, registrar nullifies hidden field when recommender.none changes', async () => {
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    const payload = {
      declaration: {
        'applicant.age': 19,
        'applicant.dobUnknown': true,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': false, // Makes recommender.name visible
        'recommender.name': {
          firstname: 'Jane',
          surname: 'Smith'
        },
        'recommender.id': '1234',
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    // Step 2: Registration agent declares with recommender.none = false (recommender.name is visible)
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Assign the event to registrar for registration
    const assignmentInput = generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
    await registrarClient.event.actions.assignment.assign(assignmentInput)

    // Step 4: Registrar changes recommender.none to true and nullifies hidden fields
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'recommender.none': true, // Makes recommender.name hidden
        'recommender.name': null, // Explicitly nullify
        'recommender.id': null // Explicitly nullify
      }
    })

    const response =
      await registrarClient.event.actions.register.request(registerPayload)

    const requestedAction = getRequestedRegisterAction(response)
    if (requestedAction?.status === ActionStatus.Requested) {
      expect(requestedAction.declaration).toHaveProperty(
        'recommender.name',
        null
      )
      expect(requestedAction.declaration).toHaveProperty(
        'recommender.none',
        true
      )
    }

    // Verify current event state no longer has recommender fields
    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )
    expect(currentState.declaration['recommender.name']).toBeUndefined()

    expect(currentState.declaration['recommender.none']).toBe(true)
  })

  test('registration agent declares, registrar attempts to set hidden field with value - should fail', async () => {
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    const payload = {
      declaration: {
        'applicant.age': 19,
        'applicant.dobUnknown': true,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': false,
        'recommender.id': '1234',
        'recommender.name': {
          firstname: 'Jane',
          surname: 'Smith'
        },
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    // Step 2: Registration agent declares with recommender.none = false
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Assign the event to registrar for registration
    const assignmentInput = generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
    await registrarClient.event.actions.assignment.assign(assignmentInput)

    // Step 4: Registrar changes recommender.none to true BUT tries to send a value for hidden field
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'recommender.none': true, // Makes recommender.name hidden
        'recommender.name': {
          // ❌ Trying to set value for hidden field
          firstname: 'Different',
          surname: 'Person'
        }
      }
    })

    await expect(
      registrarClient.event.actions.register.request(registerPayload)
    ).rejects.toMatchSnapshot()
  })

  test('registration agent declares, registrar attempts to add invalid field - should fail', async () => {
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    // Step 2: Registration agent declares
    const payload = {
      declaration: {
        'applicant.age': 19,
        'applicant.dobUnknown': true,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': true,
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Assign the event to registrar for registration
    const assignmentInput = generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
    await registrarClient.event.actions.assignment.assign(assignmentInput)

    // Step 4: Registrar tries to add non-existent field during registration
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'invalid.field': 'some value',
        'another.invalid.age': { age: 20, asOfDateRef: 'applicant.dob' }
      }
    })

    const error = await registrarClient.event.actions.register
      .request(registerPayload)
      .catch((e) => e)

    expect(error).toBeInstanceOf(TRPCError)
    expect(error.message).toContain(
      'Field with id invalid.field not found in event config'
    )
  })

  test('registration agent declares with hidden page field, registrar attempts to set different value for still-hidden field - should fail', async () => {
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    // Step 2: Registration agent declares with senior-pass page HIDDEN (dob > 1950)
    const payload = {
      declaration: {
        'applicant.dob': '2000-02-01', // senior-pass page is hidden
        'applicant.dobUnknown': false,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': true,
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Registrar tries to add field from hidden page during registration
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'senior-pass.id': '9876543210' // ❌ Page is still hidden
      }
    })

    await expect(
      registrarClient.event.actions.register.request(registerPayload)
    ).rejects.toMatchSnapshot()
  })

  test('registration agent declares minimal data, registrar completes with valid visible fields', async () => {
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    // Step 2: Registration agent declares with minimal data
    const payload = {
      declaration: {
        'applicant.age': 19,
        'applicant.dobUnknown': true,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': true,
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Assign the event to registrar for registration
    const assignmentInput = generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
    await registrarClient.event.actions.assignment.assign(assignmentInput)

    // Step 4: Registrar adds additional valid visible fields during registration
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'applicant.email': 'applicant@example.com' // Valid visible field
      }
    })

    const response =
      await registrarClient.event.actions.register.request(registerPayload)

    const requestedAction = getRequestedRegisterAction(response)
    if (requestedAction?.status === ActionStatus.Requested) {
      expect(requestedAction.declaration).toHaveProperty(
        'applicant.email',
        'applicant@example.com'
      )
    }

    // Verify current event state has the new field
    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )
    expect(currentState.declaration['applicant.email']).toBe(
      'applicant@example.com'
    )
  })

  test('registration agent declares with visible conditional field, registrar changes condition and nullifies multiple hidden fields', async () => {
    const { user: agent } = await setupTestCase()
    const registrationAgentClient = createTestClient(agent, [
      encodeScope({
        type: 'record.create',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      }),
      encodeScope({
        type: 'record.declare',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })
    ])

    const registrarClient = createTestClient(user)

    // Step 1: Registration agent creates event
    const event = await registrationAgentClient.event.create(
      generator.event.create()
    )

    // Step 2: Registration agent declares with both conditional contexts visible
    const payload = {
      declaration: {
        'applicant.dob': '1944-02-01', // Makes senior-pass page visible
        'applicant.dobUnknown': false,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'recommender.none': false, // Makes recommender fields visible
        'recommender.name': {
          firstname: 'Jane',
          surname: 'Smith'
        },
        'recommender.id': 'jane@example.com',
        'senior-pass.id': '1234567890',
        'senior-pass.recommender': true,
        'applicant.address': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'State',
            district2: 'District2'
          }
        }
      }
    }
    await registrationAgentClient.event.actions.declare.request(
      generator.event.actions.declare(event.id, payload)
    )

    // Step 3: Assign the event to registrar for registration
    const assignmentInput = generator.event.actions.assign(event.id, {
      assignedTo: user.id
    })
    await registrarClient.event.actions.assignment.assign(assignmentInput)

    // Step 4: Registrar changes both conditions and nullifies all hidden fields
    const registerPayload = generator.event.actions.register(event.id, {
      declaration: {
        ...payload.declaration,
        'applicant.dob': '2000-02-01', // Hides senior-pass page
        'recommender.none': true, // Hides recommender fields
        'recommender.name': null,
        'recommender.id': null,
        'senior-pass.id': null,
        'senior-pass.recommender': null
      }
    })

    const response =
      await registrarClient.event.actions.register.request(registerPayload)

    const requestedAction = getRequestedRegisterAction(response)
    if (requestedAction?.status === ActionStatus.Requested) {
      // All hidden fields should be null in the action
      expect(requestedAction.declaration).toHaveProperty(
        'recommender.name',
        null
      )
      expect(requestedAction.declaration).toHaveProperty('recommender.id', null)
      expect(requestedAction.declaration).toHaveProperty('senior-pass.id', null)
      expect(requestedAction.declaration).toHaveProperty(
        'senior-pass.recommender',
        null
      )
    }

    // Verify current event state has none of the hidden fields
    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )
    expect(currentState.declaration['recommender.name']).toBeUndefined()
    expect(currentState.declaration['recommender.id']).toBeUndefined()
    expect(currentState.declaration['senior-pass.id']).toBeUndefined()
    expect(currentState.declaration['senior-pass.recommender']).toBeUndefined()
    expect(currentState.declaration['applicant.dob']).toBe('2000-02-01')
    expect(currentState.declaration['recommender.none']).toBe(true)
  })
})

test('System user can not register an event, even with the right scope', async () => {
  const { generator, user } = await setupTestCase()

  const humanUserClient = createTestClient(user)

  const systemUserClient = createSystemTestClient('test-system', [
    encodeScope({ type: 'record.register' })
  ])

  const event = await humanUserClient.event.create(generator.event.create())
  await humanUserClient.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  await expect(
    systemUserClient.event.actions.register.request(
      generator.event.actions.register(event.id)
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})
