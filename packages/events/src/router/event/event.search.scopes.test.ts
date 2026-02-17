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
/* eslint-disable max-lines */
import { http, HttpResponse } from 'msw'
import fc from 'fast-check'
import {
  ActionType,
  ActionTypes,
  AddressType,
  DeclarationActionType,
  FieldType,
  JurisdictionFilter,
  RecordScopeV2,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP,
  UserFilter,
  createPrng,
  encodeScope,
  generateEventConfig,
  generateTranslationConfig,
  getOrThrow,
  pickRandom
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  seedEvent,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import {
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'
import { env } from '../../environment'
import { getClient } from '../../storage/postgres/events'
import {
  getEventIndexName,
  getOrCreateClient
} from '../../storage/elasticsearch'

test('single scope, multi-filter combinations', async () => {
  const rng = createPrng(123453)
  const generator = payloadGenerator(rng)

  // 1. Create realistic hierarchy with users.
  const { users, administrativeAreas, isUnderAdministrativeArea } =
    await setupHierarchyWithUsers()

  const leafLevelAdminAreas = administrativeAreas.filter((aa) =>
    administrativeAreas.every((other) => other.parentId !== aa.id)
  )

  // 2. Each user creates and declares an event using duplicate data.
  for (const user of users) {
    const testClient = createTestClient(user, [
      'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
      'record.read[event=birth|death|tennis-club-membership|child-onboarding]',
      'record.notify[event=birth|death|tennis-club-membership|child-onboarding]',
      'record.declare[event=birth|death|tennis-club-membership|child-onboarding]'
    ])

    const event = await testClient.event.create(generator.event.create())
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
          administrativeArea: pickRandom(rng, leafLevelAdminAreas).id,
          streetLevelDetails: {
            state: 'state',
            district2: 'district2'
          }
        }
      }
    })

    await testClient.event.actions.declare.request(data)
  }

  // 3. Setup possible combinations of jurisdiction and user filters.
  const jurisdictionOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    { nil: undefined }
  )

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const testUsers = fc.constantFrom(...users)

  const scopeCombinations = fc.record({
    user: testUsers,
    declaredIn: jurisdictionOptions,
    declaredBy: userOptions,
    placeOfEvent: jurisdictionOptions
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({ user, declaredIn, declaredBy, placeOfEvent }) => {
        const searchScope = encodeScope({
          type: 'record.search',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredIn,
            declaredBy,
            placeOfEvent
          }
        })

        const testClient = createTestClient(user, [searchScope])

        const { results } = await testClient.event.search({
          query: {
            type: 'and',
            clauses: [
              {
                eventType: TENNIS_CLUB_MEMBERSHIP,
                data: {
                  'applicant.name': { type: 'fuzzy', term: 'Unique' }
                }
              }
            ]
          }
        })

        // 0. Even with the most restrictive filters, there should be some results.
        expect(results.length).toBeGreaterThan(0)

        // 1. User should only see their own declarations when declaredBy=user filter is set.
        if (declaredBy === UserFilter.enum.user) {
          for (const r of results) {
            expect(r.legalStatuses.DECLARED?.createdBy).toBe(user.id)
          }
        }

        // 2. user should only see declarations from their exact location when declaredIn=location is set.
        if (declaredIn === JurisdictionFilter.enum.location) {
          for (const r of results) {
            expect(r.legalStatuses.DECLARED?.createdAtLocation).toBe(
              user.primaryOfficeId
            )

            const otherUserInLocation = getOrThrow(
              users.find(
                (user2) =>
                  user.primaryOfficeId === user2.primaryOfficeId &&
                  user.id !== user2.id
              ),
              'No other user in the same location'
            )

            expect([otherUserInLocation.id, user.id]).toContain(
              r.legalStatuses.DECLARED?.createdBy
            )
          }
        }

        // 3. user should see declarations from offices under the same administrative area when declaredIn=administrativeArea is set.
        if (declaredIn === JurisdictionFilter.enum.administrativeArea) {
          for (const r of results) {
            const officeId = getOrThrow(
              r.legalStatuses.DECLARED?.createdAtLocation,
              'createdAtLocation is undefined'
            )

            expect(
              isUnderAdministrativeArea(officeId, user.administrativeAreaId)
            ).toBe(true)
          }
        }

        // 4. User should see all declarations when declaredIn=all and no declaredBy and placeOfEvent filter is set
        if (
          declaredIn === JurisdictionFilter.enum.all &&
          declaredBy === undefined &&
          placeOfEvent === undefined
        ) {
          expect(results.length).toBe(users.length)
        }

        // 5. User should only see declarations from their exact location when placeOfEvent=location is set.
        if (placeOfEvent === JurisdictionFilter.enum.location) {
          for (const r of results) {
            expect(r.placeOfEvent).toBe(user.primaryOfficeId)
          }
        }

        // 6. User should only see declarations from their administrative area when placeOfEvent=administrativeArea is set.
        if (placeOfEvent === JurisdictionFilter.enum.administrativeArea) {
          for (const r of results) {
            const eventLocation = getOrThrow(
              r.placeOfEvent,
              'placeOfEvent is undefined'
            )

            expect(
              isUnderAdministrativeArea(
                eventLocation,
                user.administrativeAreaId
              )
            ).toBe(true)
          }
        }
      }
    ),
    {
      numRuns: 200
    }
  )
})

test('multi-scope combinations', async () => {
  const rng = createPrng(1234)

  const generator = payloadGenerator(rng)
  // 1. Create realistic hierarchy with users.
  const { users, administrativeAreas } = await setupHierarchyWithUsers()

  const leafLevelAdminAreas = administrativeAreas.filter((aa) =>
    administrativeAreas.every((other) => other.parentId !== aa.id)
  )

  // 2. Each user creates and declares an event using duplicate data.
  for (const user of users) {
    const testClient = createTestClient(user, [
      'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
      'record.read[event=birth|death|tennis-club-membership|child-onboarding]',
      'record.notify[event=birth|death|tennis-club-membership|child-onboarding]',
      'record.declare[event=birth|death|tennis-club-membership|child-onboarding]'
    ])

    const event = await testClient.event.create(generator.event.create())
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
          administrativeArea: pickRandom(rng, leafLevelAdminAreas).id,
          streetLevelDetails: {
            state: 'state',
            district2: 'district2'
          }
        }
      }
    })

    await testClient.event.actions.declare.request(data)
  }

  // 3. Setup possible combinations of jurisdiction and user filters.
  const jurisdictionOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    { nil: undefined }
  )

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const testUsers = fc.constantFrom(...users)

  const scopeCombinations = fc.record({
    user: testUsers,
    placeOfEvent1: jurisdictionOptions,
    placeOfEvent2: jurisdictionOptions,
    declaredIn1: jurisdictionOptions,
    declaredBy1: userOptions,
    declaredIn2: jurisdictionOptions,
    declaredBy2: userOptions
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({
        user,
        declaredIn1,
        declaredBy1,
        declaredIn2,
        declaredBy2,
        placeOfEvent1,
        placeOfEvent2
      }) => {
        const scope1 = {
          type: 'record.search',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredIn: declaredIn1,
            declaredBy: declaredBy1,
            placeOfEvent: placeOfEvent1
          }
        }

        const scope2 = {
          type: 'record.search',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredBy: declaredBy2,
            declaredIn: declaredIn2,
            placeOfEvent: placeOfEvent2
          }
        }

        const scopes = [scope1, scope2]

        const testClient = createTestClient(user, scopes.map(encodeScope))

        const searchResult = await testClient.event.search({
          query: {
            type: 'and',
            clauses: [
              {
                eventType: TENNIS_CLUB_MEMBERSHIP,
                data: {
                  'applicant.name': { type: 'fuzzy', term: 'Unique' }
                }
              }
            ]
          }
        })

        // 0. Even with the most restrictive filters, there should be some results.
        expect(searchResult.results.length).toBeGreaterThan(0)

        // 1. Strictest filter is applied only when the other all scopes have it. User should only see their own declarations when declaredBy=user filter is set on both.
        if (
          scope1.options.declaredBy === UserFilter.enum.user &&
          scope2.options.declaredBy === UserFilter.enum.user
        ) {
          for (const r of searchResult.results) {
            expect(r.legalStatuses.DECLARED?.createdBy).toBe(user.id)
          }
        }

        // 2. Strictest filter is applied only when the other all scopes have it. User should only see declarations from their exact location placeOfEvent is set on both (and uses default).
        if (
          scope1.options.placeOfEvent === JurisdictionFilter.enum.location &&
          scope2.options.placeOfEvent === JurisdictionFilter.enum.location
        ) {
          for (const r of searchResult.results) {
            expect(r.placeOfEvent).toBe(user.primaryOfficeId)
          }
        }
      }
    ),
    {
      numRuns: 200
    }
  )
})

test('combined registeredIn and declaredIn filters in scope', async () => {
  const { users, administrativeAreas } = await setupHierarchyWithUsers()
  const rng = createPrng(567823)
  const generator = payloadGenerator(rng)

  const provinceA = administrativeAreas.find(
    (area) => area.name === 'Province A'
  )
  const userInProvinceA = users.find(
    (user) => user.administrativeAreaId === provinceA?.id
  )

  const districtA = administrativeAreas.find(
    (area) => area.name === 'District A'
  )
  const userInDistrictA = users.find(
    (user) => user.administrativeAreaId === districtA?.id
  )

  if (!userInProvinceA || !userInDistrictA) {
    throw new Error('Test users not found')
  }

  const searchScope = {
    type: 'record.search',
    options: {
      event: [TENNIS_CLUB_MEMBERSHIP],
      declaredIn: JurisdictionFilter.enum.administrativeArea,
      registeredIn: JurisdictionFilter.enum.administrativeArea
    }
  } satisfies RecordScopeV2

  const userInDistrictAClient = createTestClient(userInDistrictA, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope(searchScope)
  ])

  const userInProvinceAClient = createTestClient(userInProvinceA, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope(searchScope)
  ])

  const originalEvent = await userInDistrictAClient.event.create(
    generator.event.create()
  )

  const declareInput = generator.event.actions.declare(originalEvent.id)

  const leafLevelAdminAreas = administrativeAreas.filter((aa) =>
    administrativeAreas.every((other) => other.parentId !== aa.id)
  )

  await userInDistrictAClient.event.actions.declare.request({
    ...declareInput,
    declaration: {
      ...declareInput.declaration,
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: pickRandom(rng, leafLevelAdminAreas).id,
        streetLevelDetails: {
          state: 'state',
          district2: 'district2'
        }
      }
    }
  })

  await userInProvinceAClient.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, {
      assignedTo: userInProvinceA.id
    })
  )

  await userInProvinceAClient.event.actions.register.request(
    generator.event.actions.register(originalEvent.id, {
      declaration: {}
    })
  )

  const query = {
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP
      }
    ]
  }

  const { results: districtAUserResults } =
    await userInDistrictAClient.event.search({
      query
    })

  const { results: provinceAUserResults } =
    await userInProvinceAClient.event.search({
      query
    })

  // Even if the event was declared in District A, the user there should not see it as it was registered in Province A.
  expect(districtAUserResults.length).toBe(0)
  expect(provinceAUserResults.length).toBe(1)
})

test('combined registeredBy and declaredBy filters in scope', async () => {
  const { users, administrativeAreas } = await setupHierarchyWithUsers()
  const rng = createPrng(567822)
  const generator = payloadGenerator(rng)

  const provinceA = administrativeAreas.find(
    (area) => area.name === 'Province A'
  )
  const userInProvinceA = users.find(
    (user) => user.administrativeAreaId === provinceA?.id
  )

  const districtA = administrativeAreas.find(
    (area) => area.name === 'District A'
  )
  const userInDistrictA = users.find(
    (user) => user.administrativeAreaId === districtA?.id
  )

  if (!userInProvinceA || !userInDistrictA) {
    throw new Error('Test users not found')
  }

  const searchScope = {
    type: 'record.search',
    options: {
      event: [TENNIS_CLUB_MEMBERSHIP],
      declaredBy: UserFilter.enum.user,
      registeredBy: UserFilter.enum.user
    }
  } satisfies RecordScopeV2

  const userInDistrictAClient = createTestClient(userInDistrictA, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope(searchScope)
  ])

  const userInProvinceAClient = createTestClient(userInProvinceA, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope(searchScope)
  ])

  const originalEvent = await userInDistrictAClient.event.create(
    generator.event.create()
  )

  const declareInput = generator.event.actions.declare(originalEvent.id)

  const leafLevelAdminAreas = administrativeAreas.filter((aa) =>
    administrativeAreas.every((other) => other.parentId !== aa.id)
  )

  await userInDistrictAClient.event.actions.declare.request({
    ...declareInput,
    declaration: {
      ...declareInput.declaration,
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: pickRandom(rng, leafLevelAdminAreas).id,
        streetLevelDetails: {
          state: 'state',
          district2: 'district2'
        }
      }
    }
  })

  await userInProvinceAClient.event.actions.assignment.assign(
    generator.event.actions.assign(originalEvent.id, {
      assignedTo: userInProvinceA.id
    })
  )

  await userInProvinceAClient.event.actions.register.request(
    generator.event.actions.register(originalEvent.id, {
      declaration: {}
    })
  )

  const query = {
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP
      }
    ]
  }

  const { results: districtAUserResults } =
    await userInDistrictAClient.event.search({
      query
    })

  const { results: provinceAUserResults } =
    await userInProvinceAClient.event.search({
      query
    })

  // None of the users should see the event as it was declared by or registered by a different user than themselves.
  expect(districtAUserResults.length).toBe(0)
  expect(provinceAUserResults.length).toBe(0)
})

test('placeOfEvent scope filters out results between locations and administrative areas', async () => {
  const addressFieldId = 'whereEventHappened'
  const eventType = 'event-with-optional-address'

  const eventWithOptionalAddress = generateEventConfig({
    id: eventType,
    fields: [
      {
        type: FieldType.ADDRESS,
        id: addressFieldId,
        label: generateTranslationConfig('Place of Event'),
        required: false
      },
      {
        type: FieldType.TEXT,
        id: 'textField',
        label: generateTranslationConfig('Some Text Field'),
        required: true
      }
    ],
    placeOfEventId: addressFieldId
  })

  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
      return HttpResponse.json([eventWithOptionalAddress])
    })
  )

  const { users } = await setupHierarchyWithUsers()

  const user = users[0]

  const clientWithActionScopes = createTestClient(user, [
    `record.create[event=${eventType}]`,
    `record.read[event=${eventType}]`,
    `record.notify[event=${eventType}]`,
    `record.declare[event=${eventType}]`
  ])

  // 1. Create event without placeOfEvent filled (defaults to user's location)
  const eventWithoutPlaceOfEventFilled =
    await clientWithActionScopes.event.create({
      transactionId: 'tx-001',
      type: eventType
    })

  await expect(
    clientWithActionScopes.event.actions.declare.request({
      eventId: eventWithoutPlaceOfEventFilled.id,
      type: ActionType.DECLARE,
      transactionId: '12312312312',
      declaration: {
        textField: 'Some text'
      }
    })
  ).resolves.toBeDefined()

  // 2. Create event with placeOfEvent filled (input user's administrative area)
  const eventWithPlaceOfEventFilled = await clientWithActionScopes.event.create(
    {
      transactionId: 'tx-002',
      type: eventType
    }
  )

  await expect(
    clientWithActionScopes.event.actions.declare.request({
      eventId: eventWithPlaceOfEventFilled.id,
      type: ActionType.DECLARE,
      transactionId: '12312312312-2',
      declaration: {
        textField: 'Some text',
        whereEventHappened: {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: user.administrativeAreaId
        }
      }
    })
  ).resolves.toBeDefined()

  // 3. Search with different placeOfEvent scopes
  const searchClientLocation = createTestClient(user, [
    encodeScope({
      type: 'record.search',
      options: {
        placeOfEvent: 'location'
      }
    })
  ])

  const searchClientAdministrativeArea = createTestClient(user, [
    encodeScope({
      type: 'record.search',
      options: {
        placeOfEvent: 'administrativeArea'
      }
    })
  ])

  const { results: resultsLocation } = await searchClientLocation.event.search({
    query: {
      type: 'and',
      clauses: [
        {
          eventType
        }
      ]
    }
  })

  const { results: resultsAdministrativeArea } =
    await searchClientAdministrativeArea.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType
          }
        ]
      }
    })

  // 4. User should see both events when searching with administrativeArea filter
  expect(resultsAdministrativeArea.length).toBe(2)
  expect(user.administrativeAreaId).toBeDefined()
  expect(
    resultsAdministrativeArea.some(
      (r) => r.placeOfEvent === user.administrativeAreaId
    )
  ).toBe(true)
  expect(
    resultsAdministrativeArea.some(
      (r) => r.placeOfEvent === user.primaryOfficeId
    )
  ).toBe(true)

  // 5. User should see only the event which defaulted to their location
  expect(resultsLocation.length).toBe(1)
  expect(resultsLocation[0].placeOfEvent).toBe(user.primaryOfficeId)
})

test('For users in locations directly under country "administrativeArea" and "all" behave the same independent of jurisdiction filter', async () => {
  const { users } = await setupHierarchyWithUsers()
  const rng = createPrng(567824)

  const eventsDb = getClient()

  // 1. Seed events with various combinations of users. All users perform same actions on same event type.
  const actionsArb = fc.constantFrom<DeclarationActionType[]>([
    ActionTypes.enum.DECLARE,
    ActionTypes.enum.REGISTER
  ])

  const eventConfigArb = fc.constantFrom(tennisClubMembershipEvent)
  const usersArb = fc.constantFrom(...users)

  const eventSeedArb = fc.record({
    eventConfig: eventConfigArb,
    actions: actionsArb,
    user: usersArb
  })
  const sampleSize = 100 // default max results

  const sampledEvents = fc.sample(eventSeedArb, sampleSize)

  for (const seed of sampledEvents) {
    await seedEvent(eventsDb, {
      eventConfig: seed.eventConfig,
      actions: seed.actions,
      user: seed.user,
      rng
    })
  }

  // 2. Fetch all events that were just seeded.
  const events = await eventsDb
    .selectFrom('events')
    .select(['id', 'eventType'])
    .execute()

  expect(events.length).toEqual(sampleSize)

  // 3. Index the events to elasticsearch. Tests would timeout when creating >12 registered events
  const spy = vi.fn()
  mswServer.use(
    http.post(`${env.COUNTRY_CONFIG_URL}/reindex`, async (req) => {
      const body = await req.request.json()
      spy(body)

      return HttpResponse.json({})
    })
  )
  const reindexClient = createTestClient(users[0], [SCOPES.RECORD_REINDEX])

  await expect(reindexClient.event.reindex()).resolves.not.toThrow()

  const esClient = getOrCreateClient()

  // 3.1 Reindex doesn't refresh the index automatically, as it would block the event stream unnecessarily. We need to manually refresh the index to see the changes
  await esClient.indices.refresh({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  })

  // 4. Pick a user in location directly under country (no administrative area)
  const userInLocationUnderCountry = users.find(
    (user) => user.administrativeAreaId === null
  )

  if (!userInLocationUnderCountry) {
    throw new Error('Test user not found')
  }

  // 5. Given the user's location, all the combinations of "administrativeArea" and "all" should return same results.
  const searchScopeOptions = [
    {
      declaredIn: JurisdictionFilter.enum.administrativeArea
    },
    {
      declaredIn: JurisdictionFilter.enum.all
    },
    {
      placeOfEvent: JurisdictionFilter.enum.administrativeArea
    },
    {
      placeOfEvent: JurisdictionFilter.enum.all
    },
    {
      registeredIn: JurisdictionFilter.enum.administrativeArea
    },
    {
      registeredIn: JurisdictionFilter.enum.all
    },
    {},
    {
      declaredIn: JurisdictionFilter.enum.administrativeArea,
      placeOfEvent: JurisdictionFilter.enum.administrativeArea,
      registeredIn: JurisdictionFilter.enum.administrativeArea
    },
    {
      declaredIn: JurisdictionFilter.enum.all,
      placeOfEvent: JurisdictionFilter.enum.all,
      registeredIn: JurisdictionFilter.enum.all
    },
    {
      declaredIn: JurisdictionFilter.enum.all,
      placeOfEvent: JurisdictionFilter.enum.administrativeArea,
      registeredIn: JurisdictionFilter.enum.all
    },
    {
      declaredIn: JurisdictionFilter.enum.all,
      placeOfEvent: JurisdictionFilter.enum.administrativeArea
    }
  ]

  for (const options of searchScopeOptions) {
    const searchClient = createTestClient(userInLocationUnderCountry, [
      encodeScope({
        type: 'record.search',
        options
      })
    ])

    const results = await searchClient.event.search({
      query: {
        type: 'and',
        clauses: [
          {
            eventType: TENNIS_CLUB_MEMBERSHIP
          }
        ]
      }
    })

    expect(results.results.length).toBe(sampleSize)
  }
})
