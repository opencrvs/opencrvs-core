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

import {
  ActionStatus,
  ActionType,
  AddressType,
  EventStatus,
  generateActionDocument,
  getCurrentEventState,
  getMixedPath,
  getUUID,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'

import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  getGrowingCombinations,
  sanitizeForSnapshot,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'
import { indexAllEvents } from '@events/service/indexing/indexing'

test('Throws error without proper scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, ['record.declare-birth'])

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
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.name.firstname': 'Unique'
          }
        }
      ]
    })
  ).rejects.toThrowError('FORBIDDEN')
})

test('Returns empty list when no events match search criteria', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const fetchedEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          'applicant.name': { type: 'exact', term: 'Johnson' }
        }
      }
    ]
  })

  expect(fetchedEvents).toEqual([])
})

test('Throws when searching without payload', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [SCOPES.SEARCH_BIRTH])

  // @ts-expect-error - Intentionally passing an empty object to trigger the error
  await expect(client.event.search({})).rejects.toMatchSnapshot()
})

test('Throws when searching by unrelated properties', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [SCOPES.SEARCH_BIRTH])

  await expect(
    client.event.search({
      type: 'and',
      clauses: [
        {
          completelyUnrelatedProperty: 'cat'
        }
      ]
    })
  ).rejects.toMatchSnapshot()
})

test('Throws when searching with empty clauses', async () => {
  const { user } = await setupTestCase()

  const client = createTestClient(user, [SCOPES.SEARCH_BIRTH])

  await expect(
    client.event.search({
      type: 'and',
      clauses: []
    })
  ).rejects.toMatchSnapshot()
})

test('Throws when date field is invalid', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.SEARCH_BIRTH])

  await expect(
    client.event.search({
      type: 'and',
      clauses: [
        {
          updatedAt: {
            type: 'exact',
            term: 'invalid-date'
          }
        }
      ]
    })
  ).rejects.toMatchSnapshot()
})

test('Throws when one of the date range fields has invalid date', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.SEARCH_BIRTH])

  await expect(
    client.event.search({
      type: 'and',
      clauses: [
        {
          updatedAt: {
            type: 'range',
            gte: 'invalid-date',
            lt: '2023-01-01'
          }
        }
      ]
    })
  ).rejects.toMatchSnapshot()
})

test('Returns events based on the updatedAt column', async () => {
  const { user, generator, seed, eventsDb } = await setupTestCase()

  const client = createTestClient(user, [
    SCOPES.SEARCH_BIRTH,
    ...TEST_USER_DEFAULT_SCOPES
  ])

  const oldEventCreatedAt = new Date(2022, 5, 6).toISOString()

  const oldEventCreateAction = generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.CREATE,
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

  await seed.event(eventsDb, user, oldDocumentWithoutAcceptedDeclaration)
  await indexAllEvents(tennisClubMembershipEvent)

  const newlyCreatedEvent = await client.event.create(generator.event.create())
  const newlyCreatedEvent2 = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(newlyCreatedEvent.id)
  )
  await client.event.actions.declare.request(
    generator.event.actions.declare(newlyCreatedEvent2.id)
  )

  const oldEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        // updatedAt changes are triggered by certain status changes, in which CREATED is included.  See up-to-date definition for updatedAt in EventMetadata.ts.
        updatedAt: {
          type: 'range',
          gte: '2022-01-01',
          lt: '2023-01-02'
        }
      }
    ]
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

  const today = new Date().toISOString()
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const acceptedTodayResult = await client.event.search({
    type: 'and',
    clauses: [
      {
        updatedAt: {
          type: 'range',
          gte: today.split('T')[0],
          lt: tomorrow.split('T')[0]
        }
      }
    ]
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

test('Returns events based on the "legalStatuses.REGISTERED.acceptedAt" column and requsted timezone', async () => {
  const { user, generator, seed, eventsDb } = await setupTestCase()

  const client = createTestClient(user, [
    SCOPES.SEARCH_BIRTH,
    ...TEST_USER_DEFAULT_SCOPES
  ])

  const oldEventCreatedAt = new Date(2022, 5, 6).toISOString()

  const oldEventCreateAction = generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.CREATE,
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

  await seed.event(eventsDb, user, oldDocumentWithoutAcceptedDeclaration)
  await indexAllEvents(tennisClubMembershipEvent)
})

test.skip('Returns events that match the name field criteria of applicant', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const fetchedEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          // @TODO: Fix when working on https://github.com/opencrvs/opencrvs-core/issues/9765
          'applicant.name.firstname': { type: 'exact', term: 'John' },
          applicant____dob: { type: 'exact', term: '2000-01-01' }
        }
      }
    ]
  })

  expect(fetchedEvents).toHaveLength(2)
})

test('Returns events that match date of birth of applicant', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const fetchedEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          applicant____dob: { type: 'exact', term: '2000-01-01' }
        }
      }
    ]
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
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const fetchedEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          applicant____dob: { type: 'exact', term: '1999-11-11' } // search with same day and month
        }
      }
    ]
  })
  expect(fetchedEvents).toHaveLength(0)
})

test('Returns single document after creation', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const response = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          applicant____dob: {
            type: 'exact',
            term: '2000-11-11'
          }
        }
      }
    ]
  })

  expect(response).toHaveLength(1)
})

test('Returns multiple documents after creation', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const response = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          applicant____dob: {
            type: 'exact',
            term: '2000-11-11'
          }
        }
      }
    ]
  })

  // event1 and event2 should be returned
  expect(response).toHaveLength(2)
})

test('Returns no documents when search params are not matched', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const response = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: {
          applicant____firstname: {
            type: 'exact',
            term: 'Nothing'
          },
          applicant____surname: {
            type: 'exact',
            term: 'Matching'
          }
        }
      }
    ]
  })

  expect(response).toHaveLength(0)
})

test('Throws error when search params are not matching proper schema', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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
      type: 'and',
      clauses: [
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            applicant____firstname: 'Johnny' // invalid schema
          }
        }
      ]
    })
  ).rejects.toThrowError()
})

test('Returns events assigned to a specific user', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'search.birth',
    'search.death',
    'record.declare-birth'
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

  const fetchedEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        assignedTo: { type: 'exact', term: user.id }
      }
    ]
  })

  expect(fetchedEvents).toHaveLength(2)
  expect(fetchedEvents.every(({ assignedTo }) => assignedTo === user.id)).toBe(
    true
  )
})

test('Returns relevant events in right order', async () => {
  const { user, generator } = await setupTestCase(4432)

  const client = createTestClient(user)

  // Until we have a way to reindex from mongodb, we create events through API.
  // Since it is expensive and time consuming, we will run multiple checks against the same set of events.
  const actions = [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REJECT,
    ActionType.ARCHIVE,
    ActionType.REGISTER,
    ActionType.PRINT_CERTIFICATE
  ]

  const actionCombinations = getGrowingCombinations(actions)

  // 1. Create events with all combinations of actions
  for (const actionCombination of actionCombinations) {
    await createEvent(client, generator, actionCombination)
  }

  // 2. Ensure we return only events that match the action type (1 each)
  const declaredEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        status: { type: 'exact', term: EventStatus.enum.DECLARED }
      }
    ]
  })

  expect(declaredEvents).toHaveLength(1)
  expect(
    sanitizeForSnapshot(declaredEvents[0], UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()

  const registeredEvents = await client.event.search({
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        status: { type: 'exact', term: EventStatus.enum.REGISTERED }
      }
    ]
  })

  expect(registeredEvents).toHaveLength(1)
  expect(
    sanitizeForSnapshot(registeredEvents[0], UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()

  // 3. Search by past timestamp, which should not match to any event.
  const eventsCreatedBeforeTests = await client.event.search({
    type: 'and',
    clauses: [
      {
        createdAt: {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          type: 'range',
          gte: '2020-01-01',
          lt: '2022-01-01'
        }
      }
    ]
  })

  expect(eventsCreatedBeforeTests).toHaveLength(0)

  // 4. Search by future timestamp, which should match to all events.
  const eventsCreatedToday = await client.event.search({
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
  })

  expect(eventsCreatedToday).toHaveLength(actionCombinations.length)

  const eventStatuses = eventsCreatedToday.map((event) => event.status)

  // 5. Order of statuses should stay constant. Whatever that is.
  expect(eventStatuses).toMatchSnapshot()

  // 6. Search by partial name
  const partialName = 'Sara'
  const eventsByName = await client.event.search({
    type: 'or',
    clauses: [
      { data: { 'applicant.name': { type: 'fuzzy', term: partialName } } },
      { data: { 'recommender.name': { type: 'fuzzy', term: partialName } } }
    ]
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
