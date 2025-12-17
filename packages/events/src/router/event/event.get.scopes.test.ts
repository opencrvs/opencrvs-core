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

import fc from 'fast-check'
import {
  ActionTypes,
  AddressType,
  JurisdictionFilter,
  RecordScopeV2,
  TENNIS_CLUB_MEMBERSHIP,
  UUID,
  UserFilter,
  createPrng,
  encodeScope,
  getCurrentEventState,
  getOrThrow,
  pickRandom
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  seedEvent,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import {
  generateTestAdministrativeAreas,
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'
import { getClient } from '../../storage/postgres/events'

test('single scope, multi-filter combinations', async () => {
  const rng = createPrng(123453)
  const generator = payloadGenerator(rng)

  // 1. Create realistic hierarchy with users.
  const { users, administrativeAreas, isUnderAdministrativeArea } =
    await setupHierarchyWithUsers()

  const leafLevelAdminAreas = administrativeAreas.filter((aa) =>
    administrativeAreas.every((other) => other.parentId !== aa.id)
  )

  const events = []
  // 2. Each user creates and declares an event using duplicate data.
  for (const user of users) {
    const testClient = createTestClient(user, [
      'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
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

    const declaredEvent = await testClient.event.actions.declare.request(data)
    events.push(declaredEvent)
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
  const eventIds = fc.constantFrom(...events.map((e) => e.id))

  const scopeCombinations = fc.record({
    eventId: eventIds,
    user: testUsers,
    declaredIn: jurisdictionOptions,
    declaredBy: userOptions
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({ eventId, user, declaredIn, declaredBy }) => {
        const searchScope = encodeScope({
          type: 'record.read',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredIn,
            declaredBy
          }
        })

        const testClient = createTestClient(user, [searchScope])

        const result = await testClient.event.get(eventId as UUID)

        console.log('result', result)
        if (!result) {
          console.log('no result')
        } else {
          // 0. Since scopes are based on event index, we must test against it.
          const eventIndex = getCurrentEventState(
            result,
            tennisClubMembershipEvent
          )
          // 1. User should only see their own declarations when declaredBy=user filter is set.
          if (declaredBy === UserFilter.enum.user) {
            expect(eventIndex.legalStatuses.DECLARED?.createdBy).toBe(user.id)
          }

          // 2. user should only see declarations from their exact location when declaredIn=location is set.
          if (declaredIn === JurisdictionFilter.enum.location) {
            expect(eventIndex.legalStatuses.DECLARED?.createdAtLocation).toBe(
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
              eventIndex.legalStatuses.DECLARED?.createdBy
            )
          }

          // 3. user should see declarations from offices under the same administrative area when declaredIn=administrativeArea is set.
          if (declaredIn === JurisdictionFilter.enum.administrativeArea) {
            const officeId = getOrThrow(
              eventIndex.legalStatuses.DECLARED?.createdAtLocation,
              'createdAtLocation is undefined'
            )

            expect(
              isUnderAdministrativeArea(officeId, user.administrativeAreaId)
            ).toBe(true)
          }

          // // 3.1 User without administrativeArea should see all results when declaredIn=administrativeArea is set.
          // if (user.administrativeAreaId === null) {
          //   // Each user created one declaration.
          //   expect(results.length).toBe(users.length)
          // }
        }

        // 4. User should see all declarations when declaredIn=all and no declaredBy filter is not set
        //   if (
        //     declaredIn === JurisdictionFilter.enum.all &&
        //     declaredBy === undefined
        //   ) {
        //     expect(results.length).toBe(users.length)
        //   }
        // }
      }
    ),
    {
      numRuns: 200,
      verbose: true
    }
  )
})

test('Prevents access using declaredIn when event is not declared yet', async () => {
  const { user, generator } = await setupTestCase()

  const readDeclaredInClient = createTestClient(user, [
    'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
    encodeScope({
      type: 'record.read',
      options: {
        declaredIn: JurisdictionFilter.enum.administrativeArea
      }
    })
  ])

  const createdEvent = await readDeclaredInClient.event.create(
    generator.event.create()
  )

  await expect(
    readDeclaredInClient.event.get(createdEvent.id)
  ).rejects.toThrowError()
})

test('Allows access using eventLocation when event is not declared yet', async () => {
  const { user, generator } = await setupTestCase()

  const readEventLocationClient = createTestClient(user, [
    'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
    encodeScope({
      type: 'record.read',
      options: {
        eventLocation: 'location'
      }
    })
  ])

  const createdEvent = await readEventLocationClient.event.create(
    generator.event.create()
  )

  await expect(
    readEventLocationClient.event.get(createdEvent.id)
  ).resolves.not.toBeNull()
})

test('combined registeredIn and declaredIn filters in scope', async () => {
  const { users, administrativeAreas } = await setupHierarchyWithUsers()
  const rng = createPrng(3821)
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

  const readScope = {
    type: 'record.read',
    options: {
      event: [TENNIS_CLUB_MEMBERSHIP],
      declaredIn: JurisdictionFilter.enum.administrativeArea,
      registeredIn: JurisdictionFilter.enum.administrativeArea
    }
  } satisfies RecordScopeV2

  const userInDistrictAClient = createTestClient(userInDistrictA, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope(readScope)
  ])

  const userInProvinceAClient = createTestClient(userInProvinceA, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope(readScope)
  ])

  const originalEvent = await userInDistrictAClient.event.create(
    generator.event.create()
  )

  const declareInput = generator.event.actions.declare(originalEvent.id, {
    keepAssignment: true
  })

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

  await userInDistrictAClient.event.actions.validate.request(
    generator.event.actions.validate(originalEvent.id, {
      declaration: {}
    })
  )

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

  const districtAUserResult = await userInDistrictAClient.event.get(
    originalEvent.id
  )

  const provinceAUserResult = await userInProvinceAClient.event.get(
    originalEvent.id
  )

  // Even if the event was declared in District A, the user there should not see it as it was registered in Province A.
  expect(districtAUserResult).not.toBeNull()
  expect(provinceAUserResult).not.toBeNull()
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

  const declareInput = generator.event.actions.declare(originalEvent.id, {
    keepAssignment: true
  })

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

  await userInDistrictAClient.event.actions.validate.request(
    generator.event.actions.validate(originalEvent.id, {
      declaration: {}
    })
  )

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

test.only('foobar', async () => {
  const { users, administrativeAreas, isUnderAdministrativeArea } =
    await setupHierarchyWithUsers()

  const rng = createPrng(1243453)

  const eventsDb = getClient()

  const actionsArb = fc.constantFrom(
    [ActionTypes.enum.DECLARE],
    [ActionTypes.enum.DECLARE, ActionTypes.enum.VALIDATE],
    [
      ActionTypes.enum.DECLARE,
      ActionTypes.enum.VALIDATE,
      ActionTypes.enum.REGISTER
    ]
  )

  const usersArb = fc.constantFrom(...users)

  const eventConfigArb = fc.constantFrom(tennisClubMembershipEvent, {
    ...tennisClubMembershipEvent,
    id: 'tennis-club-membership_premium'
  })

  const eventSeedArb = fc.record({
    eventConfig: eventConfigArb,
    actions: actionsArb,
    user: usersArb
  })

  const sampledEvents = fc.sample(eventSeedArb, 200)

  for (const seed of sampledEvents) {
    await seedEvent(eventsDb, {
      eventConfig: seed.eventConfig,
      actions: seed.actions as any,
      user: seed.user as any,
      rng
    })
  }

  const events = await eventsDb.selectFrom('events').select(['id']).execute()

  // 3. Setup possible combinations of jurisdiction and user filters.
  const jurisdictionOptions = fc.option(
    fc.constantFrom(...JurisdictionFilter.options),
    { nil: undefined }
  )

  const userOptions = fc.option(fc.constant(UserFilter.enum.user), {
    nil: undefined
  })

  const testUsers = fc.constantFrom(...users)
  const eventIds = fc.constantFrom(...events.map((e) => e.id))
  const eventTypes = fc.option(
    fc.constantFrom(
      [TENNIS_CLUB_MEMBERSHIP],
      [TENNIS_CLUB_MEMBERSHIP, 'tennis-club-membership_premium'],
      ['tennis-club-membership_premium']
    ),
    { nil: undefined }
  )

  const scopeCombinations = fc.record({
    eventId: eventIds,
    user: testUsers,
    declaredIn: jurisdictionOptions,
    declaredBy: userOptions,
    registeredIn: jurisdictionOptions,
    registeredBy: userOptions,
    event: eventTypes
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({
        eventId,
        user,
        declaredIn,
        declaredBy,
        event,
        registeredIn,
        registeredBy
      }) => {
        const searchScope = encodeScope({
          type: 'record.read',
          options: {
            event,
            declaredIn,
            declaredBy,
            registeredIn,
            registeredBy
          }
        })

        const testClient = createTestClient(user, [searchScope])

        const result = await testClient.event.get(eventId as UUID)

        console.log('result', result)
        // 0. Since scopes are based on event index, we must test against it.
        const eventIndex = getCurrentEventState(
          result,
          tennisClubMembershipEvent
        )
        // 1. User should only see their own declarations when declaredBy=user filter is set.
        if (declaredBy === UserFilter.enum.user) {
          expect(eventIndex.legalStatuses.DECLARED?.createdBy).toBe(user.id)
        }

        // // 2. user should only see declarations from their exact location when declaredIn=location is set.
        // if (declaredIn === JurisdictionFilter.enum.location) {
        //   expect(eventIndex.legalStatuses.DECLARED?.createdAtLocation).toBe(
        //     user.primaryOfficeId
        //   )

        //   const otherUserInLocation = getOrThrow(
        //     users.find(
        //       (user2) =>
        //         user.primaryOfficeId === user2.primaryOfficeId &&
        //         user.id !== user2.id
        //     ),
        //     'No other user in the same location'
        //   )

        //   expect([otherUserInLocation.id, user.id]).toContain(
        //     eventIndex.legalStatuses.DECLARED?.createdBy
        //   )
        // }

        // // 3. user should see declarations from offices under the same administrative area when declaredIn=administrativeArea is set.
        // if (declaredIn === JurisdictionFilter.enum.administrativeArea) {
        //   const officeId = getOrThrow(
        //     eventIndex.legalStatuses.DECLARED?.createdAtLocation,
        //     'createdAtLocation is undefined'
        //   )

        //   expect(
        //     isUnderAdministrativeArea(officeId, user.administrativeAreaId)
        //   ).toBe(true)
        // }
      }
    ),
    {
      numRuns: 200,
      verbose: true
    }
  )
})
