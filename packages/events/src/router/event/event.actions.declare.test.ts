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
import { http, HttpResponse, HttpResponseInit } from 'msw'
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
  TENNIS_CLUB_MEMBERSHIP,
  ActionUpdate,
  EventState,
  EventDocument,
  encodeScope
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventWithDedupCheck
} from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  setupTestCase,
  createSystemTestClient,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { CreatedUser, payloadGenerator } from '@events/tests/generators'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { encodeEventIndex } from '@events/service/indexing/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { EventNotFoundError } from '@events/service/events/events'

function getRequestedRegisterAction(response: EventDocument) {
  const savedAction = response.actions.find(
    ({ type, status }: { type: ActionType; status: ActionStatus }) =>
      type === ActionType.DECLARE && status === ActionStatus.Requested
  )

  expect(savedAction?.status).toEqual(ActionStatus.Requested)

  return savedAction
}

/* eslint-disable max-lines */
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

  test('prevents access if configurable scope does not have required event type allowed', async () => {
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['death']
        }
      })
    ])

    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(eventId, {})
      )
    ).rejects.toMatchObject(new EventNotFoundError(eventId))
  })

  test('allows access if required scope is present', async () => {
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.declare',
        options: {
          event: ['death', 'birth', 'tennis-club-membership']
        }
      })
    ])

    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(eventId, {})
      )
    ).resolves.not.toThrow()
  })

  test('Validation error message contains all the offending fields', async () => {
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.declare'
      })
    ])

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
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.declare'
      })
    ])

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
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {
            state: 'state',
            district2: 'district2'
          }
        }
      }
    })

    await expect(
      client.event.actions.declare.request(data)
    ).rejects.matchSnapshot()
  })

  test('Skips required field validation when they are conditionally hidden', async () => {
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.declare'
      })
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
        addressType: 'DOMESTIC',
        administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a', // leaf level location
        streetLevelDetails: {
          state: 'state',
          district2: 'district2'
        }
      }
    } satisfies ActionUpdate

    const data = generator.event.actions.declare(eventId, {
      declaration: form
    })

    const response = await client.event.actions.declare.request(data)

    const savedAction = getRequestedRegisterAction(response)
    if (savedAction?.status === ActionStatus.Requested) {
      expect(savedAction.declaration).toEqual(form)
    }
  })

  test('gives validation error when a conditional page, which is visible, has a required field', async () => {
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.declare'
      })
    ])

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
        administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
        streetLevelDetails: {
          state: 'state',
          district2: 'district2'
        }
      }
    } satisfies EventState

    const data = generator.event.actions.declare(eventId, {
      declaration: form
    })

    await expect(
      client.event.actions.declare.request(data)
    ).rejects.matchSnapshot()
  })

  test('successfully validates a fields on a conditional page, which is visible', async () => {
    const client = createTestClient(user, [
      encodeScope({ type: 'record.declare' })
    ])

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
        administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
        streetLevelDetails: {
          state: 'state',
          district2: 'district2'
        }
      }
    } satisfies EventState

    const data = generator.event.actions.declare(eventId, {
      declaration: form
    })

    const response = await client.event.actions.declare.request(data)

    const savedAction = getRequestedRegisterAction(response)
    if (savedAction?.status === ActionStatus.Requested) {
      expect(savedAction.declaration).toEqual(form)
    }
  })

  test('Prevents adding birth date in future', async () => {
    const client = createTestClient(user, [
      encodeScope({ type: 'record.declare' })
    ])

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
          state: 'state',
          district2: 'district2'
        }
      }
    } satisfies EventState

    const payload = generator.event.actions.declare(eventId, {
      declaration: form
    })

    await expect(
      client.event.actions.declare.request(payload)
    ).rejects.matchSnapshot()
  })

  test('validation prevents including hidden fields', async () => {
    const client = createTestClient(user, [
      encodeScope({ type: 'record.declare' })
    ])

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
    const client = createTestClient(user, [
      encodeScope({ type: 'record.declare' })
    ])

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
    const client = createTestClient(user, [
      encodeScope({ type: 'record.read' }),
      encodeScope({ type: 'record.declare' })
    ])

    const data = generator.event.actions.declare(eventId)
    await client.event.actions.declare.request(data)
    const updatedEvent = await client.event.get({ eventId })

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

  test(`DECLARE is idempotent`, async () => {
    const client = createTestClient(user, [
      encodeScope({ type: 'record.declare' })
    ])

    const data = generator.event.actions.declare(eventId, {
      keepAssignment: true
    })

    const firstResponse = await client.event.actions.declare.request(data)
    const secondResponse = await client.event.actions.declare.request(data)

    expect(firstResponse).toEqual(secondResponse)
  })

  test(`DECLARE action can be resubmitted after it fails in country config`, async () => {
    const spy = vi.fn()
    mswServer.use(
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/DECLARE`,
        () => {
          spy()
          return new HttpResponse(null, { status: 500 } as HttpResponseInit)
        }
      )
    )
    const client = createTestClient(user, [
      encodeScope({ type: 'record.declare' })
    ])

    const data = generator.event.actions.declare(eventId, {
      keepAssignment: true
    })

    await expect(client.event.actions.declare.request(data)).rejects.toThrow()
    mswServer.use(
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/DECLARE`,
        () => {
          spy()
          return HttpResponse.json()
        }
      )
    )
    await client.event.actions.declare.request(data)
    expect(spy).toHaveBeenCalledTimes(2)
  })
})

test('deduplication and annotation check is performed after declaration', async () => {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () => {
      return HttpResponse.json([
        tennisClubMembershipEventWithDedupCheck(ActionType.DECLARE)
      ])
    })
  )
  const esClient = getOrCreateClient()
  const prng = createPrng(73)
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.read' }),
    encodeScope({ type: 'record.declare' })
  ])

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
  ) as Partial<EventState>

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

  const lastAction = declaredEvent.actions.at(-1)
  if (!lastAction) {
    throw new Error('No action found')
  }

  expect(lastAction.type).toBe(ActionType.DUPLICATE_DETECTED)
  expect(lastAction).toHaveProperty('annotation')
  // @ts-expect-error - type not narrowed for duplicate action
  expect(lastAction.annotation).toBeDefined()

  expect(
    getCurrentEventState(declaredEvent, tennisClubMembershipEvent)
      .potentialDuplicates
  ).toEqual([
    { id: existingEventId, trackingId: existingEventIndex.trackingId }
  ])
})

describe('Declare action - hidden field nullification', () => {
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

  describe('Invalid keys scenarios', () => {
    test('rejects hidden field with non-null value', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
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
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      await expect(
        client.event.actions.declare.request(payload)
      ).rejects.toMatchSnapshot()
    })

    test('rejects multiple hidden fields with non-null values', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
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
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const error = await client.event.actions.declare
        .request(payload)
        .catch((e) => e)

      expect(error).toBeInstanceOf(TRPCError)
      expect(error.code).toBe('BAD_REQUEST')
      // Should mention both offending fields
      expect(error.message).toContain('recommender.name')
      expect(error.message).toContain('recommender.id')
    })

    test('rejects non-existent field', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Field does not exist in form config
          'nonexistent.field': 'some value',
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      await expect(
        client.event.actions.declare.request(payload)
      ).rejects.toMatchSnapshot()
    })

    test('rejects hidden field from conditional page', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
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
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      await expect(
        client.event.actions.declare.request(payload)
      ).rejects.toMatchSnapshot()
    })
  })

  describe('Valid keys scenarios', () => {
    test('accepts hidden field with null value (intentional clearing)', async () => {
      const client = createTestClient(user, [
        ...TEST_USER_DEFAULT_SCOPES,
        'search[event=tennis-club-membership,access=my-jurisdiction]'
      ])

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
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
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const response = await client.event.actions.declare.request(payload)

      const savedAction = getRequestedRegisterAction(response)
      if (savedAction?.status === ActionStatus.Requested) {
        // The null value should be included in the declaration
        expect(savedAction.declaration).toHaveProperty('recommender.name', null)
      }

      const { results: fetchedEvents } = await client.event.search({
        query: {
          type: 'and',
          clauses: [
            {
              eventType: TENNIS_CLUB_MEMBERSHIP,
              data: {
                'applicant.name': { type: 'fuzzy', term: 'John' },
                'applicant.dob': { type: 'exact', term: '2024-02-01' }
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
    })

    test('accepts multiple hidden fields with null values', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Multiple hidden fields explicitly set to null
          'recommender.name': null,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const response = await client.event.actions.declare.request(payload)

      const savedAction = getRequestedRegisterAction(response)
      if (savedAction?.status === ActionStatus.Requested) {
        expect(savedAction.declaration).toHaveProperty('recommender.name', null)
      }
    })

    test('accepts visible field with any value', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
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
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const response = await client.event.actions.declare.request(payload)
      const savedAction = getRequestedRegisterAction(response)
      if (savedAction?.status === ActionStatus.Requested) {
        expect(savedAction.declaration).toHaveProperty('recommender.name', {
          firstname: 'Jane',
          surname: 'Smith'
        })
      }
    })

    test('accepts field from conditional page when page is visible', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          // DOB before 1950 makes senior-pass page VISIBLE
          'applicant.dob': '1944-02-01',
          'applicant.dobUnknown': false,
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
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const response = await client.event.actions.declare.request(payload)

      const savedAction = getRequestedRegisterAction(response)
      if (savedAction?.status === ActionStatus.Requested) {
        expect(savedAction.declaration).toHaveProperty(
          'senior-pass.id',
          '1234567890'
        )
      }
    })

    test('omits hidden field when not provided (default behavior)', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01',
          'applicant.dobUnknown': false,
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
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const response = await client.event.actions.declare.request(payload)

      const savedAction = getRequestedRegisterAction(response)
      if (savedAction?.status === ActionStatus.Requested) {
        // Hidden field should not be in the declaration at all
        expect(savedAction.declaration).not.toHaveProperty('recommender.name')
      }
    })
  })

  describe('Edge cases', () => {
    test('accepts null for hidden field on hidden page', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          // DOB after 1950 means senior-pass page is HIDDEN
          'applicant.dob': '2000-02-01',
          'applicant.dobUnknown': false,
          'applicant.name': {
            firstname: 'John',
            surname: 'Doe'
          },
          'recommender.none': true,
          // Explicitly clearing field on hidden page
          'recommender.name': null,
          'recommender.id': null,
          'senior-pass.id': null,
          'senior-pass.recommender': null,
          'applicant.address': {
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const response = await client.event.actions.declare.request(payload)

      const savedAction = getRequestedRegisterAction(response)
      if (savedAction?.status === ActionStatus.Requested) {
        expect(savedAction.declaration).toHaveProperty('recommender.name', null)
      }
    })

    test('mixed valid but hidden and invalid keys returns only invalid keys in error', async () => {
      const client = createTestClient(user)

      const payload = generator.event.actions.declare(eventId, {
        declaration: {
          'applicant.dob': '2024-02-01', // ✅ Valid
          'applicant.dobUnknown': false, // ✅ Valid
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
          'nonexistent.field': 'test', // ❌ Invalid: doesn't exist
          'applicant.address': {
            // ✅ Valid
            country: 'FAR',
            addressType: AddressType.DOMESTIC,
            administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
            streetLevelDetails: {
              state: 'state',
              district2: 'district2'
            }
          }
        }
      })

      const error = await client.event.actions.declare
        .request(payload)
        .catch((e) => e)

      expect(error).toBeInstanceOf(TRPCError)
      // Should only mention invalid keys
      expect(error.message).toEqual(
        'Field with id nonexistent.field not found in event config'
      )
    })
  })
})

test('System user can not declare an event, even with the right scope', async () => {
  const { generator, locations } = await setupTestCase()
  const systemUserClient = createSystemTestClient('test-system', [
    encodeScope({ type: 'record.create' }),
    encodeScope({ type: 'record.declare' })
  ])

  const event = await systemUserClient.event.create({
    ...generator.event.create(),
    createdAtLocation: locations[0].id
  })

  await expect(
    systemUserClient.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})
