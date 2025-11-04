/* eslint-disable max-lines */
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
  EventIndex,
  generateActionDuplicateDeclarationInput,
  generateRegistrationNumber,
  getCurrentEventState,
  getOrThrow,
  getUUID
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventWithDedupCheck
} from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  createCountryConfigClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

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
    'record.register[event=birth|death|tennis-club-membership]'
  ])

  await expect(
    client.event.actions.register.request(
      generator.event.actions.register('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('can not register an event that is not first declared and validated', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [])

  await expect(
    client.event.actions.register.request(
      generator.event.actions.register(event.id)
    )
  ).rejects.matchSnapshot()
})

test('Validation error message contains all the offending fields', async () => {
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

  /** Partial payload is accepted, so it should not complain about fields already send during declaration. */
  const data = generator.event.actions.register(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'recommender.none': true,
      'applicant.dobUnknown': false
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
  const client = createTestClient(user)
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
    streetLevelDetails: {
      state: 'State',
      district2: 'District2'
    }
  }
} satisfies ActionUpdate

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const { id: eventId } = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE
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
    const client = createTestClient(user)
    const originalEvent = await createEvent(client, generator, [
      ActionType.DECLARE,
      ActionType.VALIDATE
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
      const client = createTestClient(user)
      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE,
        ActionType.VALIDATE
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
      const client = createTestClient(user)
      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE,
        ActionType.VALIDATE
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

      const event = await client.event.get(eventId)
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
      const client = createTestClient(user)
      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE,
        ActionType.VALIDATE
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
      const client = createTestClient(user)

      const { id: eventId } = await createEvent(client, generator, [
        ActionType.DECLARE,
        ActionType.VALIDATE
      ])

      mockNotifyApi(500)

      await expect(
        client.event.actions.register.request(
          generator.event.actions.register(eventId)
        )
      ).rejects.matchSnapshot()

      const registeredEvent = await client.event.get(eventId)

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
      const client = createTestClient(user)

      const event = await createEvent(client, generator, [
        ActionType.DECLARE,
        ActionType.VALIDATE
      ])

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
        const client = createTestClient(user)
        const event = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
        ])

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
        const client = createTestClient(user)

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
        const client = createTestClient(user)

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
        const client = createTestClient(user)
        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
        const client = createTestClient(user)

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
        const client = createTestClient(user)

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
        const client = createTestClient(user)
        const event = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
        ])

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
        const client = createTestClient(user)
        const event = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
        ])
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
        const client = createTestClient(user)
        const event = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
        ])

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
        const client = createTestClient(user)
        const event = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
        ])

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
        const client = createTestClient(user)

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
        const client = createTestClient(user)

        const originalEvent = await createEvent(client, generator, [
          ActionType.DECLARE,
          ActionType.VALIDATE
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
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(ActionType.REGISTER)
      ])
    })
  )
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

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
  await client.event.actions.validate.request(
    generator.event.actions.validate(duplicateEvent.id, {
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
    status: 'VALIDATED',
    potentialDuplicates: [
      { id: existingEvent.id, trackingId: existingEvent.trackingId }
    ]
  } satisfies Partial<EventIndex>)
})
