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
import {
  ActionStatus,
  ActionType,
  AddressType,
  getUUID,
  SCOPES
} from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { HttpResponse, http } from 'msw'
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
  const client = createTestClient(user, [SCOPES.RECORD_REGISTER])

  await expect(
    client.event.actions.register.request(
      generator.event.actions.register('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.register(event.id, {
    data: {
      'applicant.dob': '02-02',
      'recommender.none': true
    }
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
    data: {
      'applicant.dob': '02-1-2024',
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
    client.event.actions.register.request(data)
  ).rejects.matchSnapshot()
})

const validFormData = {
  'applicant.dob': '2024-02-01',
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

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.register(event.id, {
    data: validFormData
  })

  const response = await client.event.actions.register.request(data)
  const savedAction = response.actions.find(
    (action) => action.type === ActionType.REGISTER
  )
  expect(savedAction?.data).toEqual(validFormData)
  expect(savedAction?.status).toEqual(ActionStatus.Accepted)
})

test('Prevents adding birth date in future', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2040-02-01',
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

  const payload = generator.event.actions.register(event.id, {
    data: form
  })

  await expect(
    client.event.actions.register.request(payload)
  ).rejects.matchSnapshot()
})

export const MOCK_REGISTRATION_NUMBER = '1MY2TEST3NRO'

describe('Request and confirmation flow', () => {
  let actionId: string

  function mockNotifyApi(status: number) {
    return mswServer.use(
      http.post<never, { actionId: string }>(
        `${env.COUNTRY_CONFIG_URL}/events/TENNIS_CLUB_MEMBERSHIP/actions/REGISTER`,
        async ({ request }) => {
          const body = await request.json()
          actionId = body.actionId

          const responseBody =
            status === 200
              ? { registrationNumber: MOCK_REGISTRATION_NUMBER }
              : {}
          // For some reason the msw types here complain about the status, even though this is correct
          // https://mswjs.io/docs/api/http-response/

          // @ts-ignore
          return HttpResponse.json(responseBody, { status })
        }
      )
    )
  }

  describe('Synchronous confirmation flow', () => {
    test('should mark action as accepted if notify API returns HTTP 200', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)
      const event = await client.event.create(generator.event.create())

      mockNotifyApi(200)

      const data = generator.event.actions.register(event.id, {
        data: validFormData
      })

      const response = await client.event.actions.register.request(data)
      const savedAction = response.actions.find(
        (action) => action.type === ActionType.REGISTER
      )
      expect(savedAction?.data).toEqual(validFormData)
      expect(savedAction?.status).toEqual(ActionStatus.Accepted)
      expect(savedAction?.registrationNumber).toEqual(MOCK_REGISTRATION_NUMBER)
    })

    test('should mark action as rejected if notify API returns HTTP 400', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)
      const event = await client.event.create(generator.event.create())

      mockNotifyApi(400)

      const data = generator.event.actions.register(event.id, {
        data: validFormData
      })

      const response = await client.event.actions.register.request(data)
      const savedAction = response.actions.find(
        (action) => action.type === ActionType.REGISTER
      )
      expect(savedAction?.data).toEqual(validFormData)
      expect(savedAction?.registrationNumber).toBeUndefined()
      expect(savedAction?.status).toEqual(ActionStatus.Rejected)
    })

    test('should not save action if notify API returns HTTP 500', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)
      const { id: eventId } = await client.event.create(
        generator.event.create()
      )

      mockNotifyApi(500)

      const data = generator.event.actions.register(eventId, {
        data: validFormData
      })

      await expect(
        client.event.actions.register.request(data)
      ).rejects.matchSnapshot()

      const event = await client.event.get(eventId)
      const registerActions = event.actions.filter(
        (action) => action.type === ActionType.REGISTER
      )
      expect(registerActions).toHaveLength(0)
    })
  })

  describe('Asynchronous confirmation flow', () => {
    test('should save action in requested state if notify API returns HTTP 202', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)
      const event = await client.event.create(generator.event.create())

      mockNotifyApi(202)

      const data = generator.event.actions.register(event.id, {
        data: validFormData
      })

      const response = await client.event.actions.register.request(data)
      const savedAction = response.actions.find(
        (action) => action.type === ActionType.REGISTER
      )
      expect(savedAction?.data).toEqual(validFormData)
      expect(savedAction?.registrationNumber).toBeUndefined()
      expect(savedAction?.status).toEqual(ActionStatus.Requested)
    })

    describe('Accepting', () => {
      test('should not be able to accept the action if action is not first requested', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user)
        const event = await client.event.create(generator.event.create())

        mockNotifyApi(202)

        const data = generator.event.actions.register(event.id, {
          data: validFormData
        })

        await expect(
          client.event.actions.register.accept({
            ...data,
            actionId: getUUID(),
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })
        ).rejects.matchSnapshot()
      })

      // TODO CIHAN: sit ku reject toimii, nii tän voi tehdä
      test.skip('should not be able to accept action if action is already rejected', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user)
        const event = await client.event.create(generator.event.create())
        const eventId = event.id

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId, {
          data: validFormData
        })

        await client.event.actions.register.request(data)

        await client.event.actions.register.reject({
          eventId,
          actionId,
          transactionId: getUUID()
        })

        await expect(
          client.event.actions.register.accept({
            ...data,
            actionId,
            registrationNumber: MOCK_REGISTRATION_NUMBER
          })
        ).rejects.matchSnapshot()
      })

      test('should successfully accept a previously requested action', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user)
        const event = await client.event.create(generator.event.create())
        const eventId = event.id

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId, {
          data: validFormData
        })

        await client.event.actions.register.request(data)

        const response = await client.event.actions.register.accept({
          ...data,
          transactionId: getUUID(),
          actionId,
          registrationNumber: MOCK_REGISTRATION_NUMBER
        })

        const registerActions = response.actions.filter(
          (action) => action.type === ActionType.REGISTER
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1].status).toEqual(ActionStatus.Accepted)
        expect(registerActions[1].data).toEqual(validFormData)
        expect(registerActions[1].registrationNumber).toEqual(
          MOCK_REGISTRATION_NUMBER
        )
      })

      test('should be able to call accept multiple times, without creating duplicate accept actions', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user)
        const event = await client.event.create(generator.event.create())
        const eventId = event.id

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId, {
          data: validFormData
        })

        await client.event.actions.register.request(data)

        await client.event.actions.register.accept({
          ...data,
          transactionId: getUUID(),
          actionId,
          registrationNumber: MOCK_REGISTRATION_NUMBER
        })

        const response = await client.event.actions.register.accept({
          ...data,
          transactionId: getUUID(),
          actionId,
          registrationNumber: MOCK_REGISTRATION_NUMBER
        })

        const registerActions = response.actions.filter(
          (action) => action.type === ActionType.REGISTER
        )

        expect(registerActions.length).toBe(2)
        expect(registerActions[0].status).toEqual(ActionStatus.Requested)
        expect(registerActions[1].status).toEqual(ActionStatus.Accepted)
        expect(registerActions[1].data).toEqual(validFormData)
      })
      test.todo('should be able to edit the event data while accept action')
    })

    describe('Rejecting', () => {
      test('should not be able to reject the action if action is not first requested', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user)
        const event = await client.event.create(generator.event.create())

        mockNotifyApi(202)

        const data = generator.event.actions.register(event.id, {
          data: validFormData
        })

        await expect(
          client.event.actions.register.reject({
            ...data,
            actionId: getUUID()
          })
        ).rejects.matchSnapshot()
      })

      test('should not be able to reject the action if action is already accepted', async () => {
        const { user, generator } = await setupTestCase()
        const client = createTestClient(user)
        const event = await client.event.create(generator.event.create())
        const eventId = event.id

        mockNotifyApi(202)

        const data = generator.event.actions.register(eventId, {
          data: validFormData
        })

        await client.event.actions.register.request(data)

        await client.event.actions.register.accept({
          ...data,
          actionId,
          transactionId: getUUID(),
          registrationNumber: MOCK_REGISTRATION_NUMBER
        })

        await expect(
          client.event.actions.register.reject({
            ...data,
            actionId
          })
        ).rejects.matchSnapshot()
      })
    })
  })

  test.todo('should not be able to reject a previously accepted action')
})
