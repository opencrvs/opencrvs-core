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
  eventQueryDataGenerator,
  generateActionDeclarationInput,
  generateActionDuplicateDeclarationInput,
  UUID,
  getCurrentEventState,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventWithDedupCheck
} from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { CreatedUser, payloadGenerator } from '@events/tests/generators'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { encodeEventIndex } from '@events/service/indexing/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

describe('Declare action', () => {
  let user: CreatedUser
  let generator: ReturnType<typeof payloadGenerator>
  let eventId: UUID

  beforeEach(async () => {
    const testCase = await setupTestCase()
    user = testCase.user
    generator = testCase.generator

    const client = createTestClient(testCase.user)
    const event = await client.event.create(generator.event.create())
    eventId = event.id
  })

  test('prevents forbidden access if missing required scope', async () => {
    const client = createTestClient(user, [])

    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(eventId, {})
      )
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('prevents forbidden access if configurable scope does not have required event type allowed', async () => {
    const client = createTestClient(user, ['record.declare[event=death]'])

    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(eventId, {})
      )
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('allows access if required scope is present', async () => {
    const client = createTestClient(user, [
      'record.create[event=death|birth|tennis-club-membership]',
      'record.declare[event=death|birth|tennis-club-membership]'
    ])
    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(eventId, {})
      )
    ).resolves.not.toThrow()
  })

  test('Validation error message contains all the offending fields', async () => {
    const client = createTestClient(user)

    const data = generator.event.actions.declare(eventId, {
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
    const client = createTestClient(user)

    const data = generator.event.actions.declare(eventId, {
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
      client.event.actions.declare.request(data)
    ).rejects.matchSnapshot()
  })

  test('Skips required field validation when they are conditionally hidden', async () => {
    const client = createTestClient(user)

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

    const data = generator.event.actions.declare(eventId, {
      declaration: form
    })

    const response = await client.event.actions.declare.request(data)

    const savedAction = response.actions.find(
      ({ type, status }) =>
        type === ActionType.DECLARE && status === ActionStatus.Requested
    )

    expect(savedAction?.status).toEqual(ActionStatus.Requested)
    if (savedAction?.status === ActionStatus.Requested) {
      expect(savedAction.declaration).toEqual(form)
    }
  })

  test('gives validation error when a conditional page, which is visible, has a required field', async () => {
    const client = createTestClient(user)

    const form = {
      // When the applicant.dob is before 1950-01-01, the senior-pass.id field on senior-pass page is required
      'applicant.dob': '1944-02-01',
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

    const data = generator.event.actions.declare(eventId, {
      declaration: form
    })

    await expect(
      client.event.actions.declare.request(data)
    ).rejects.matchSnapshot()
  })

  test('successfully validates a fields on a conditional page, which is visible', async () => {
    const client = createTestClient(user)

    const form = {
      // When the applicant.dob is before 1950-01-01, the senior-pass.id field on senior-pass page is required
      'applicant.dob': '1944-02-01',
      'senior-pass.id': '1234567890',
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      },
      'recommender.none': true,
      'senior-pass.recommender': true,
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
        urbanOrRural: 'RURAL' as const,
        village: 'Small village'
      }
    }

    const data = generator.event.actions.declare(eventId, {
      declaration: form
    })

    const response = await client.event.actions.declare.request(data)

    const savedAction = response.actions.find(
      ({ type, status }) =>
        type === ActionType.DECLARE && status === ActionStatus.Requested
    )

    expect(savedAction?.status).toEqual(ActionStatus.Requested)
    if (savedAction?.status === ActionStatus.Requested) {
      expect(savedAction.declaration).toEqual(form)
    }
  })

  test('Prevents adding birth date in future', async () => {
    const client = createTestClient(user)

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

    const payload = generator.event.actions.declare(eventId, {
      declaration: form
    })

    await expect(
      client.event.actions.declare.request(payload)
    ).rejects.matchSnapshot()
  })

  test('validation prevents including hidden fields', async () => {
    const client = createTestClient(user)

    const data = generator.event.actions.declare(eventId, {
      declaration: {
        ...generateActionDeclarationInput(
          tennisClubMembershipEvent,
          ActionType.DECLARE,
          () => 0.1
        ),
        'recommender.name': { firstname: 'John', surname: 'Doe' }
      }
    })

    await expect(
      client.event.actions.declare.request(data)
    ).rejects.matchSnapshot()
  })

  test('validation prevents including miscellaneous fields', async () => {
    const client = createTestClient(user)

    const data = generator.event.actions.declare(eventId, {
      declaration: {
        ...generateActionDeclarationInput(
          tennisClubMembershipEvent,
          ActionType.DECLARE,
          () => 0.1
        ),
        'foo.bar': { firstname: 'John', surname: 'Doe' }
      }
    })

    await expect(
      client.event.actions.declare.request(data)
    ).rejects.matchSnapshot()
  })

  test('valid action is appended to event actions', async () => {
    const client = createTestClient(user)

    const data = generator.event.actions.declare(eventId)
    await client.event.actions.declare.request(data)
    const updatedEvent = await client.event.get(eventId)

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
      expect.objectContaining({
        type: ActionType.READ
      })
    ])
  })

  test(`${ActionType.DECLARE} is idempotent`, async () => {
    const client = createTestClient(user)

    const data = generator.event.actions.declare(eventId, {
      keepAssignment: true
    })

    const firstResponse = await client.event.actions.declare.request(data)
    const secondResponse = await client.event.actions.declare.request(data)

    expect(firstResponse).toEqual(secondResponse)
  })
})

test('deduplication check is performed after declaration', async () => {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(ActionType.DECLARE)
      ])
    })
  )
  const esClient = getOrCreateClient()
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const newEvent = await client.event.create(generator.event.create())
  const existingEventId = getUUID()
  const declaration = generateActionDuplicateDeclarationInput(
    tennisClubMembershipEvent,
    ActionType.DECLARE,
    prng,
    // so that applicate.dob is generated
    {
      'applicant.dobUnknown': false
    }
  )
  const existingEventIndex = eventQueryDataGenerator({
    id: existingEventId,
    declaration
  })

  await esClient.update({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
    id: existingEventId,
    body: {
      doc: encodeEventIndex(existingEventIndex, tennisClubMembershipEvent),
      doc_as_upsert: true
    },
    refresh: 'wait_for'
  })

  const declaredEvent = await client.event.actions.declare.request(
    generator.event.actions.declare(newEvent.id, {
      declaration: existingEventIndex.declaration
    })
  )
  expect(
    getCurrentEventState(declaredEvent, tennisClubMembershipEvent)
      .potentialDuplicates
  ).toEqual([
    { id: existingEventId, trackingId: existingEventIndex.trackingId }
  ])
})
