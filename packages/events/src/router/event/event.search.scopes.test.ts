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
  AddressType,
  JurisdictionFilter,
  RecordScopeV2,
  TENNIS_CLUB_MEMBERSHIP,
  UserFilter,
  createPrng,
  encodeScope,
  getOrThrow,
  pickRandom
} from '@opencrvs/commons'
import { createTestClient, TEST_USER_DEFAULT_SCOPES } from '@events/tests/utils'
import {
  payloadGenerator,
  setupHierarchyWithUsers
} from '@events/tests/generators'

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
    declaredBy: userOptions
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({ user, declaredIn, declaredBy }) => {
        const searchScope = encodeScope({
          type: 'record.search',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredIn,
            declaredBy
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

          // 3.1 User without administrativeArea should see all results when declaredIn=administrativeArea is set.
          if (user.administrativeAreaId === null) {
            // Each user created one declaration.
            expect(results.length).toBe(users.length)
          }
        }

        // 4. User should see all declarations when declaredIn=all and no declaredBy filter is not set
        if (
          declaredIn === JurisdictionFilter.enum.all &&
          declaredBy === undefined
        ) {
          expect(results.length).toBe(users.length)
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
    declaredIn1: jurisdictionOptions,
    declaredBy1: userOptions,
    declaredIn2: jurisdictionOptions,
    declaredBy2: userOptions
  })

  // 4. Property based test to verify each combination works as expected.
  await fc.assert(
    fc.asyncProperty(
      scopeCombinations,
      async ({ user, declaredIn1, declaredBy1, declaredIn2, declaredBy2 }) => {
        const scope1 = {
          type: 'record.search',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredIn: declaredIn1,
            declaredBy: declaredBy1
          }
        }

        const scope2 = {
          type: 'record.search',
          options: {
            event: [TENNIS_CLUB_MEMBERSHIP],
            declaredBy: declaredBy2,
            declaredIn: declaredIn2
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
