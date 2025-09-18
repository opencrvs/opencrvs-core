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

import { DateTime } from 'luxon'
import { TRPCError } from '@trpc/server'
import {
  ActionStatus,
  ActionType,
  AddressType,
  EventStatus,
  generateActionDocument,
  getCurrentEventState,
  getMixedPath,
  getUUID,
  InherentFlags,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP,
  TEST_SYSTEM_IANA_TIMEZONE
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createSystemTestClient,
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'
import { Location } from '@events/service/locations/locations'
test('User without any search scopes should not see any events', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const event = await client.event.create(generator.event.create())
  const data = generator.event.actions.declare(event.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
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

  await client.event.actions.declare.request(data)

  await expect(
    client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: TENNIS_CLUB_MEMBERSHIP,
            data: {
              'applicant.name.firstname': 'Unique'
            }
          }
        ]
      }
    })
  ).rejects.toThrowError('FORBIDDEN')
})

test('Returns empty list when no events match search criteria', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const initialData = {
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-01',
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

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      declaration: initialData
    })
  )

  const response = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.name': { type: 'exact', term: 'Johnson' }
          }
        }
      ]
    }
  })

  expect(response).toEqual({ total: 0, results: [] })
})

test('Throws when searching without payload', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [
    'search.birth',
    'search[event=tennis-club-membership,access=all]'
  ])

  await expect(client.event.search({})).rejects.toMatchSnapshot()
})

test('Throws when searching by unrelated properties', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [
    'search.birth',
    'search[event=tennis-club-membership,access=all]'
  ])

  await expect(
    client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            completelyUnrelatedProperty: 'cat'
          }
        ]
      }
    })
  ).rejects.toMatchSnapshot()
})

test('Throws when searching with empty clauses', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [
    'search.birth',
    'search[event=tennis-club-membership,access=all]'
  ])

  await expect(
    client.event.search({
      query: {
        type: 'and',
        clauses: []
      }
    })
  ).rejects.toMatchSnapshot()
})

test('Throws when date field is invalid', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search[event=tennis-club-membership,access=all]'
  ])

  await expect(
    client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            updatedAt: {
              type: 'exact',
              term: 'invalid-date'
            }
          }
        ]
      }
    })
  ).rejects.toMatchSnapshot()
})

test('Throws when one of the date range fields has invalid date', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search[event=tennis-club-membership,access=all]'
  ])

  await expect(
    client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            updatedAt: {
              type: 'range',
              gte: 'invalid-date',
              lte: '2023-01-01'
            }
          }
        ]
      }
    })
  ).rejects.toMatchSnapshot()
})

test('Returns events based on the updatedAt column', async () => {
  const { user, generator } = await setupTestCase()

  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    SCOPES.RECORD_IMPORT,
    ...TEST_USER_DEFAULT_SCOPES
  ])

  const oldEventCreatedAt = new Date(2022, 5, 6).toISOString()

  const oldEventCreateAction = generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.CREATE,
    user,
    defaults: {
      createdAt: oldEventCreatedAt
    }
  })

  const oldEventDeclarationRequestActions = [
    ActionType.DECLARE,
    ActionType.REGISTER
  ].map((action) =>
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action,
      user,
      defaults: {
        status: ActionStatus.Requested
      }
    })
  )

  const oldEventActions = [
    oldEventCreateAction,
    ...oldEventDeclarationRequestActions
  ]

  const oldDocumentWithoutAcceptedDeclaration = {
    trackingId: getUUID(),
    type: tennisClubMembershipEvent.id,
    actions: oldEventActions,
    createdAt: oldEventCreatedAt,
    id: getUUID(),
    updatedAt: new Date().toISOString()
  }

  await client.event.import(oldDocumentWithoutAcceptedDeclaration)

  const newlyCreatedEvent = await client.event.create(generator.event.create())
  const newlyCreatedEvent2 = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(newlyCreatedEvent.id)
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(newlyCreatedEvent2.id)
  )

  const { results: oldEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          // updatedAt changes are triggered by certain status changes, in which CREATED is included.  See up-to-date definition for updatedAt in EventMetadata.ts.
          updatedAt: {
            type: 'range',
            gte: '2022-01-01',
            lte: '2023-01-01'
          }
        }
      ]
    }
  })

  expect(oldEvents).toHaveLength(1)
  const [oldEvent] = oldEvents

  // Only accepted action should update updatedAt timestamp
  expect(oldEvent.createdAt).toEqual(oldEventCreatedAt)
  expect(oldEvent.updatedAt).toEqual(oldEventCreatedAt)

  expect(oldEvent).toEqual(
    getCurrentEventState(
      oldDocumentWithoutAcceptedDeclaration,
      tennisClubMembershipEvent
    )
  )

  const yesterday = DateTime.now()
    .setZone(TEST_SYSTEM_IANA_TIMEZONE)
    .startOf('day')
    .toFormat('yyyy-MM-dd')

  const today = DateTime.now()
    .setZone(TEST_SYSTEM_IANA_TIMEZONE)
    .endOf('day')
    .toFormat('yyyy-MM-dd')

  const { results: acceptedTodayResult } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          updatedAt: {
            type: 'range',
            gte: yesterday,
            lte: today
          }
        }
      ]
    }
  })

  expect(acceptedTodayResult).toHaveLength(2)

  acceptedTodayResult.forEach((event) => {
    const updatedAtInMillis = +new Date(event.updatedAt)
    expect(+new Date(event.createdAt)).toBeLessThan(updatedAtInMillis) // DECLARE action was accepted, so updatedAt should be greater than createdAt

    expect(event.updatedAt).toEqual(
      event.legalStatuses['DECLARED']?.acceptedAt ?? null
    )

    expect(sanitizeForSnapshot(event, UNSTABLE_EVENT_FIELDS)).toMatchSnapshot()
  })
})

test('Returns events based on the "legalStatuses.REGISTERED.acceptedAt" column', async () => {
  const { user, generator } = await setupTestCase()

  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    SCOPES.RECORD_IMPORT,
    ...TEST_USER_DEFAULT_SCOPES
  ])

  const event = await client.event.create(generator.event.create())
  await client.event.actions.declare.request({
    ...generator.event.actions.declare(event.id),
    keepAssignment: true
  })
  await client.event.actions.validate.request({
    ...generator.event.actions.validate(event.id),
    keepAssignment: true
  })
  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { results: resultForToday } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          ['legalStatuses.REGISTERED.acceptedAt']: {
            type: 'exact',
            term: today
          }
        }
      ]
    }
  })
  const { results: resultForYesterday } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          ['legalStatuses.REGISTERED.acceptedAt']: {
            type: 'exact',
            term: yesterday
          }
        }
      ]
    }
  })
  const { results: resultForTomorrow } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          ['legalStatuses.REGISTERED.acceptedAt']: {
            type: 'exact',
            term: tomorrow
          }
        }
      ]
    }
  })

  expect(resultForToday).toHaveLength(1)
  expect(resultForYesterday).toHaveLength(0)
  expect(resultForTomorrow).toHaveLength(0)
})

test.skip('Returns events that match the name field criteria of applicant', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const record1 = {
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-01',
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

  const record2 = {
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-01',
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

  const record3 = {
    'applicant.name': {
      firstname: 'Johnson', // different first name than previous records
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-01',
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

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())
  const event3 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, {
      declaration: record1
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event3.id, {
      declaration: record3
    })
  )

  const { results: fetchedEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            // @TODO: Fix when working on https://github.com/opencrvs/opencrvs-core/issues/9765
            'applicant.name.firstname': { type: 'exact', term: 'John' },
            'applicant.dob': { type: 'exact', term: '2000-01-01' }
          }
        }
      ]
    }
  })

  expect(fetchedEvents).toHaveLength(2)
})

test('Should not match partially when searching with emails against name field', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const record1 = {
    'applicant.name': {
      firstname: 'Matt',
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-01',
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

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      declaration: record1
    })
  )

  const { results: fetchedEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          data: {
            'applicant.name': { type: 'fuzzy', term: 'matt.doe@gmail.com' }
          }
        }
      ]
    }
  })

  expect(fetchedEvents).toHaveLength(0)
})
test('Returns events that match date of birth of applicant', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const record1 = {
    'applicant.name': {
      firstname: 'Johnson',
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-01',
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

  const record2 = {
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
    'applicant.dob': '2000-01-12', // different dob
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

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, {
      declaration: record1
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )

  const { results: fetchedEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '2000-01-01' }
          }
        }
      ]
    }
  })

  expect(
    getMixedPath(fetchedEvents[0].declaration, 'applicant.name.firstname')
  ).toBe('Johnson')

  // fetches first document as result
  expect(fetchedEvents).toHaveLength(1)
})

test('Does not return events when searching with a similar but different date of birth', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const record1 = {
    'applicant.name': {
      firstname: 'Johnson',
      surname: 'Doe'
    },
    'applicant.dob': '2024-11-11',
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

  const record2 = {
    'applicant.name': {
      firstname: 'Johnson',
      surname: 'Doe'
    },
    'applicant.dob': '2024-12-12',
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

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, {
      declaration: record1
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )

  const { results: fetchedEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '1999-11-11' } // search with same day and month
          }
        }
      ]
    }
  })
  expect(fetchedEvents).toHaveLength(0)
})

test('Returns single document after creation', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const event = await client.event.create(generator.event.create())
  const data = generator.event.actions.declare(event.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
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

  await client.event.actions.declare.request(data)

  const { results: response } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': {
              type: 'exact',
              term: '2000-11-11'
            }
          }
        }
      ]
    }
  })

  expect(response).toHaveLength(1)
})

test('Returns multiple documents after creation', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const event1 = await client.event.create(generator.event.create())
  const data1 = generator.event.actions.declare(event1.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
        surname: 'Lastname'
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

  await client.event.actions.declare.request(data1)

  const event2 = await client.event.create(generator.event.create())
  const data2 = generator.event.actions.declare(event2.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
        surname: 'Lastname'
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
  await client.event.actions.declare.request(data2)

  const event3 = await client.event.create(generator.event.create())
  const data3 = generator.event.actions.declare(event3.id, {
    declaration: {
      'applicant.dob': '2000-11-12',
      'applicant.name': {
        firstname: 'Different',
        surname: 'Lastname'
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

  await client.event.actions.declare.request(data3)

  const { results: response } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': {
              type: 'exact',
              term: '2000-11-11'
            }
          }
        }
      ]
    }
  })

  // event1 and event2 should be returned
  expect(response).toHaveLength(2)
})

test('Returns correctly based on registration location even when a parent location level is used for searching', async () => {
  const { user, generator, seed, locations } = await setupTestCase()

  const parentLocation = {
    ...generator.locations.set(1)[0],
    name: 'Parent location'
  }

  const newLocations: Location[] = [
    parentLocation,
    {
      ...locations[0],
      id: user.primaryOfficeId,
      name: 'Child location',
      parentId: parentLocation.id,
      locationType: 'ADMIN_STRUCTURE'
    }
  ]

  await seed.locations(newLocations)

  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const event = await client.event.create(generator.event.create())
  const data = generator.event.actions.declare(event.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
        surname: 'Lastname'
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
  await client.event.actions.declare.request(data)

  // search with parent id
  const { results: response } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          'legalStatuses.DECLARED.createdAtLocation': {
            type: 'within',
            location: parentLocation.id
          }
        }
      ]
    }
  })
  expect(response).toHaveLength(1)
})

test('Returns no documents when search params are not matched', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const event1 = await client.event.create(generator.event.create())
  const data1 = generator.event.actions.declare(event1.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
        surname: 'Lastname'
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

  await client.event.actions.declare.request(data1)

  const event2 = await client.event.create(generator.event.create())
  const data2 = generator.event.actions.declare(event2.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
        surname: 'Lastname'
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
  await client.event.actions.declare.request(data2)

  const event3 = await client.event.create(generator.event.create())
  const data3 = generator.event.actions.declare(event3.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Different',
        surname: 'Lastname'
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

  await client.event.actions.declare.request(data3)

  const { results: response } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.name': { type: 'exact', term: 'Nothing Matching' }
          }
        }
      ]
    }
  })

  expect(response).toHaveLength(0)
})

test('Throws error when search params are not matching proper schema', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const event = await client.event.create(generator.event.create())
  const data = generator.event.actions.declare(event.id, {
    declaration: {
      'applicant.dob': '2000-11-11',
      'applicant.name': {
        firstname: 'Unique',
        surname: 'Lastname'
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

  await client.event.actions.declare.request(data)

  await expect(
    client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: TENNIS_CLUB_MEMBERSHIP,
            data: {
              'applicant.firstname': 'Johnny' // invalid schema
            }
          }
        ]
      }
    })
  ).rejects.toThrowError()
})

test('Returns events assigned to a specific user', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const WindmillVillage = {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
    district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
    urbanOrRural: 'RURAL' as const,
    village: 'Windmill village, Kingdom of Goa'
  }

  const record1 = {
    'applicant.name': {
      firstname: 'Ace',
      surname: 'Portgues D'
    },
    'applicant.dob': '2000-01-01',
    'recommender.none': true,
    'applicant.address': WindmillVillage
  }

  const record2 = {
    'applicant.name': {
      firstname: 'Luffy',
      surname: 'Monkey D'
    },
    'applicant.dob': '2002-02-03',
    'recommender.none': true,
    'applicant.address': WindmillVillage
  }

  const record3 = {
    'applicant.name': {
      firstname: 'Sabo',
      surname: 'Archipelago D'
    },
    'applicant.dob': '2001-06-07',
    'recommender.none': true,
    'applicant.address': WindmillVillage
  }

  const event1 = await client.event.create(generator.event.create())
  const event2 = await client.event.create(generator.event.create())
  const event3 = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event1.id, { declaration: record1 })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event2.id, {
      declaration: record2
    })
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(event3.id, {
      declaration: record3
    })
  )

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event2.id, {
      assignedTo: user.id
    })
  )
  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event3.id, {
      assignedTo: user.id
    })
  )

  const { results: fetchedEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          assignedTo: { type: 'exact', term: user.id }
        }
      ]
    }
  })

  expect(fetchedEvents).toHaveLength(2)
  expect(fetchedEvents.every(({ assignedTo }) => assignedTo === user.id)).toBe(
    true
  )
})

test('Returns relevant events in right order', async () => {
  const { user, generator } = await setupTestCase(4432)

  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=all]'
  ])

  // Until we have a way to reindex from mongodb, we create events through API.
  // Since it is expensive and time consuming, we will run multiple checks against the same set of events.
  const actionCombinations = [
    [ActionType.DECLARE],
    [ActionType.DECLARE, ActionType.VALIDATE],
    [ActionType.DECLARE, ActionType.VALIDATE, ActionType.REJECT],
    [ActionType.DECLARE, ActionType.VALIDATE, ActionType.ARCHIVE],
    [ActionType.DECLARE, ActionType.VALIDATE, ActionType.REGISTER],
    [
      ActionType.DECLARE,
      ActionType.VALIDATE,
      ActionType.REGISTER,
      ActionType.PRINT_CERTIFICATE
    ]
  ]

  // 1. Create events with all combinations of actions
  for (const actionCombination of actionCombinations) {
    await createEvent(client, generator, actionCombination)
  }

  // 2. Ensure we return only events that match the action type (1 each)
  const { results: declaredEvents } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          status: { type: 'exact', term: EventStatus.enum.DECLARED }
        }
      ]
    }
  })

  expect(declaredEvents).toHaveLength(1)
  expect(
    sanitizeForSnapshot(declaredEvents[0], UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()

  const { results: registeredEventsPendingCertification } =
    await client.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: TENNIS_CLUB_MEMBERSHIP,
            status: { type: 'exact', term: EventStatus.enum.REGISTERED },
            flags: {
              anyOf: [InherentFlags.PENDING_CERTIFICATION]
            }
          }
        ]
      }
    })

  expect(registeredEventsPendingCertification).toHaveLength(1)
  expect(
    sanitizeForSnapshot(
      registeredEventsPendingCertification[0],
      UNSTABLE_EVENT_FIELDS
    )
  ).toMatchSnapshot()

  // 3. Search by past timestamp, which should not match to any event.
  const { results: eventsCreatedBeforeTests } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          createdAt: {
            eventType: TENNIS_CLUB_MEMBERSHIP,
            type: 'range',
            gte: '2020-01-01',
            lte: '2022-01-01'
          }
        }
      ]
    }
  })

  expect(eventsCreatedBeforeTests).toHaveLength(0)

  // 4. Search by future timestamp, which should match to all events.
  const { results: eventsCreatedToday } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          createdAt: {
            eventType: TENNIS_CLUB_MEMBERSHIP,
            type: 'exact',
            term: new Date().toISOString().split('T')[0] // today's date. Let's have something more sophisticated later.
          }
        }
      ]
    }
  })

  expect(eventsCreatedToday).toHaveLength(actionCombinations.length)

  // The score for all the events created today are the same so the
  // order of the events returned by the search is a bit flaky. I'm
  // commenting this out until we incorporate the sorting functionality

  // const eventStatuses = eventsCreatedToday.map((event) => event.status)

  // 5. Order of statuses should stay constant. Whatever that is.
  // expect(eventStatuses).toMatchSnapshot()

  // 6. Search by partial name
  const partialName = 'Sara'
  const { results: eventsByName } = await client.event.search({
    query: {
      type: 'or',
      clauses: [
        { data: { 'applicant.name': { type: 'fuzzy', term: partialName } } },
        { data: { 'recommender.name': { type: 'fuzzy', term: partialName } } }
      ]
    }
  })

  expect(eventsByName).toHaveLength(2)
  const names = eventsByName.map((event) => event.declaration['applicant.name'])

  expect(names).toEqual(
    expect.arrayContaining([
      // These names are expected to be in the events created above based on the prng. The result of the search does not seem fuzzy.
      { firstname: 'Sara', surname: 'Garcia' },
      { firstname: 'Zara', surname: 'Sarajanen' }
    ])
  )
})

test('User with my-jurisdiction scope only sees events from their primary office', async () => {
  const { user, generator, locations } = await setupTestCase(5541)
  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  const ownOfficeId = user.primaryOfficeId

  await createEvent(client, generator, [ActionType.DECLARE])

  const OTHER_OFFICE_ID = locations[1].id // using different location id for a different user
  // Create another user from a different office
  const { user: otherUser, generator: otherGen } = await setupTestCase(5542)
  const userFromOtherOffice = {
    ...otherUser,
    primaryOfficeId: OTHER_OFFICE_ID
  }

  const otherClient = createTestClient(userFromOtherOffice, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  // Create an event from another office
  await createEvent(otherClient, otherGen, [ActionType.DECLARE])

  // Test user should only see their own event
  const { results: events } = await client.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(events).toHaveLength(1)
  expect(events[0].updatedAtLocation).toBe(ownOfficeId)
  expect(
    sanitizeForSnapshot(events[0], UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
})

test('User with my-jurisdiction scope only sees events created by system user to their primary office', async () => {
  const { user, generator, locations } = await setupTestCase(5541)

  const client = createSystemTestClient('test-system', [
    `record.create[event=${TENNIS_CLUB_MEMBERSHIP}]`,
    `record.notify[event=${TENNIS_CLUB_MEMBERSHIP}]`
  ])

  const ownOfficeId = user.primaryOfficeId

  const ownLocationEvent = await client.event.create(generator.event.create())
  const otherLocationEvent = await client.event.create(generator.event.create())

  const userClient = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  await client.event.actions.notify.request({
    ...generator.event.actions.notify(ownLocationEvent.id),
    createdAtLocation: ownOfficeId
  })

  await client.event.actions.notify.request({
    ...generator.event.actions.notify(otherLocationEvent.id),
    createdAtLocation: locations[1].id
  })

  // Test user should only see event created in their own location
  const { results: events } = await userClient.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(events).toHaveLength(1)
  expect(events[0].updatedAtLocation).toBe(ownOfficeId)
  expect(
    sanitizeForSnapshot(events[0], UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
})

test('User without an event in the scope should not be able to view events of that type', async () => {
  const { user, generator, locations } = await setupTestCase(5541)
  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=birth,access=my-jurisdiction]'
  ])

  await createEvent(client, generator, [ActionType.DECLARE])

  // Create another user from a different office
  const { user: otherUser, generator: otherGen } = await setupTestCase(5542)
  const userFromOtherOffice = {
    ...otherUser,
    primaryOfficeId: locations[1].id // using different location id for a different user
  }

  const otherClient = createTestClient(userFromOtherOffice, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  // Create an event from another office
  await createEvent(otherClient, otherGen, [ActionType.DECLARE])

  // Test user should only see their own event
  const { results: events } = await client.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(events).toHaveLength(0)
})

test('User with my-jurisdiction scope can see events from other offices based on their scopes', async () => {
  const { user: userA, locations } = await setupTestCase(6003)

  const clientA = createTestClient(userA, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  const { user: userB, generator: generatorB } = await setupTestCase(6004)
  const userBOverride = {
    ...userB,
    primaryOfficeId: locations[1].id // using different location id for a different user
  }

  const clientB = createTestClient(userBOverride, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  // Only user B creates event
  await createEvent(clientB, generatorB, [ActionType.DECLARE])

  // user A should see nothing
  const { results: eventsA } = await clientA.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(eventsA).toHaveLength(0)

  const { results: eventsB } = await clientB.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  // user B should see the created event
  expect(eventsB).toHaveLength(1)
  expect(eventsB[0].updatedAtLocation).toBe(userBOverride.primaryOfficeId)
  expect(
    sanitizeForSnapshot(eventsB[0], UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
})

test('Does not return events of tennis club membership when scopes are not available', async () => {
  const { user, generator } = await setupTestCase()

  const client = createTestClient(user, [
    'search[event=birth,access=all]',
    'search.death',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  await createEvent(client, generator, [ActionType.DECLARE])

  const { results: resultEvent } = await client.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(resultEvent).toHaveLength(0)
})

test('User with "all" scope sees events from all offices', async () => {
  const { user: userA, generator: generatorA } = await setupTestCase(6005)
  const clientA = createTestClient(userA, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=all]'
  ])

  const { user: userB, generator: generatorB } = await setupTestCase(6006)
  const clientB = createTestClient(userB, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  await createEvent(clientA, generatorA, [ActionType.DECLARE])
  await createEvent(clientB, generatorB, [ActionType.DECLARE])

  const { results: events } = await clientA.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(events).toHaveLength(2)
  const locations = events.map((e) => e.updatedAtLocation)
  expect(locations).toContain(userA.primaryOfficeId)
  expect(locations).toContain(userB.primaryOfficeId)
})

test('User with both "all" and "my-jurisdiction" scopes sees all matching events', async () => {
  const { user, generator } = await setupTestCase(6007)
  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=all]',
    'search[event=birth,access=my-jurisdiction]'
  ])

  const { generator: tennisGen, user: otherUser } = await setupTestCase(6008)
  const otherClient = createTestClient(otherUser, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  await createEvent(client, generator, [ActionType.DECLARE])
  await createEvent(otherClient, tennisGen, [ActionType.DECLARE])

  const { results: events } = await client.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(events.length).toBe(2)
})

test('User only sees tennis club membership events within their jurisdiction', async () => {
  const { user, generator, locations } = await setupTestCase(6011)
  const ownOfficeId = user.primaryOfficeId

  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=my-jurisdiction]'
  ])

  // Create 2 events in user's own jurisdiction
  await createEvent(client, generator, [ActionType.DECLARE])
  await createEvent(client, generator, [ActionType.DECLARE])

  const otherOfficeId = locations[1].id // using different location id for a different user
  const userOtherOffice = { ...user, primaryOfficeId: otherOfficeId }
  const clientOtherOffice = createTestClient(userOtherOffice, [
    ...TEST_USER_DEFAULT_SCOPES,
    'search[event=tennis-club-membership,access=all]'
  ])

  await createEvent(clientOtherOffice, generator, [ActionType.DECLARE])

  // User should only see the 2 events from their own office
  const { results: events } = await client.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })

  expect(events).toHaveLength(2)
  for (const event of events) {
    expect(event.updatedAtLocation).toBe(ownOfficeId)
  }
  expect(
    events.map((e) => sanitizeForSnapshot(e, UNSTABLE_EVENT_FIELDS))
  ).toMatchSnapshot()

  // User should only see the 3 events from their all offices
  const { results: eventsOthersOffice } = await clientOtherOffice.event.search({
    query: {
      type: 'and',
      clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }]
    }
  })
  expect(eventsOthersOffice).toHaveLength(3)
  expect(
    eventsOthersOffice.map((e) => sanitizeForSnapshot(e, UNSTABLE_EVENT_FIELDS))
  ).toMatchSnapshot()
})

test('Returns paginated results when limit and size parameters are provided', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search[event=tennis-club-membership,access=all]',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]'
  ])

  const totalNumberOfRecords = 5

  const events = []
  for (let i = 0; i < totalNumberOfRecords; i++) {
    const event = await client.event.create(generator.event.create())
    const data = generator.event.actions.declare(event.id, {
      declaration: {
        'applicant.dob': '2000-01-01',
        'applicant.name': {
          firstname: `User${i}`,
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
    await client.event.actions.declare.request(data)
    events.push(event)
  }

  // Test first page with limit 2
  const { results: firstPage, total: total } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '2000-01-01' }
          }
        }
      ]
    },
    limit: 2,
    offset: 0
  })

  expect(firstPage).toHaveLength(2)
  expect(total).toEqual(totalNumberOfRecords)

  // Test second page with limit 2
  const { results: secondPage } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '2000-01-01' }
          }
        }
      ]
    },
    limit: 2,
    offset: 2
  })

  expect(secondPage).toHaveLength(2)

  // Test third page with limit 2 (should have 1 remaining)
  const { results: thirdPage } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '2000-01-01' }
          }
        }
      ]
    },
    limit: 2,
    offset: 4
  })

  expect(thirdPage).toHaveLength(1)

  // Verify no overlap between pages
  const firstPageIds = firstPage.map((e) => e.id)
  const secondPageIds = secondPage.map((e) => e.id)
  const thirdPageIds = thirdPage.map((e) => e.id)

  expect(firstPageIds).not.toEqual(expect.arrayContaining(secondPageIds))
  expect(firstPageIds).not.toEqual(expect.arrayContaining(thirdPageIds))
  expect(secondPageIds).not.toEqual(expect.arrayContaining(thirdPageIds))

  // Test with larger limit than total results
  const { results: allResults } = await client.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '2000-01-01' }
          }
        }
      ]
    },
    limit: 10,
    offset: 0
  })

  expect(allResults).toHaveLength(totalNumberOfRecords)
})

test('System integration with record search scope is allowed to search any records', async () => {
  const { user, generator, locations } = await setupTestCase(6012)
  const client = createTestClient(user)

  await createEvent(client, generator, [ActionType.DECLARE])

  // Create another user from a different office
  const { user: otherUser, generator: otherGen } = await setupTestCase(6013)
  const userFromOtherOffice = {
    ...otherUser,
    primaryOfficeId: locations[1].id // using different location id for a different user
  }

  const otherClient = createTestClient(userFromOtherOffice)

  // Create an event from another office
  await createEvent(otherClient, otherGen, [ActionType.DECLARE])

  const recordSearchClient = createSystemTestClient('test-system', [
    SCOPES.RECORDSEARCH
  ])
  const { results } = await recordSearchClient.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP
        }
      ]
    },
    limit: 10,
    offset: 0
  })

  expect(results).toHaveLength(2)
})

test('System integration without record search scope is not allowed to search any records', async () => {
  const { user, generator } = await setupTestCase(6012)
  const client = createTestClient(user)

  await createEvent(client, generator, [ActionType.DECLARE])

  const recordSearchClient = createSystemTestClient('test-system')

  await expect(
    recordSearchClient.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: TENNIS_CLUB_MEMBERSHIP
          }
        ]
      },
      limit: 10,
      offset: 0
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})
