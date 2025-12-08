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
  Location,
  LocationType,
  TENNIS_CLUB_MEMBERSHIP,
  TestUserRole,
  UUID,
  UserFilter,
  createPrng,
  encodeScope,
  generateUuid,
  getOrThrow,
  pickRandom
} from '@opencrvs/commons'
import { createTestClient } from '@events/tests/utils'
import { payloadGenerator, seeder } from '@events/tests/generators'

function generateOfficeLocations(adminAreas: Location[], rng: () => number) {
  return adminAreas.flatMap((admin) => {
    const crvs = {
      name: `${admin.name} CRVS Office`,
      locationType: LocationType.enum.CRVS_OFFICE,
      parentId: admin.id,
      id: generateUuid(rng),
      validUntil: null
    } satisfies Location

    const health = {
      name: `${admin.name} Health Facility`,
      locationType: LocationType.enum.HEALTH_FACILITY,
      parentId: admin.id,
      id: generateUuid(rng),
      validUntil: null
    } satisfies Location

    return [crvs, health]
  })
}

/**
 * Sets up a realistic hierarchy of administrative areas, offices, and users for testing scopes.
 * Each location has two users assigned to it. Hiearchies include cases where some levels are skipped or do not exist.
 *
 */
async function setupHierarchyWithUsers() {
  const rng = createPrng(1234)
  const seed = seeder()
  // Generate Administrative areas with children, some "skipping" levels.
  const provinceA = {
    name: 'Province A',
    locationType: LocationType.enum.ADMIN_STRUCTURE,
    parentId: null,
    id: generateUuid(rng),
    validUntil: null
  } satisfies Location

  const provinceB = {
    name: 'Province B',
    locationType: LocationType.enum.ADMIN_STRUCTURE,
    parentId: null,
    id: generateUuid(rng),
    validUntil: null
  } satisfies Location

  const districtC = {
    name: 'District C',
    locationType: LocationType.enum.ADMIN_STRUCTURE,
    parentId: null,
    id: generateUuid(rng),
    validUntil: null
  } satisfies Location

  const districtA = {
    name: 'District A',
    locationType: LocationType.enum.ADMIN_STRUCTURE,
    parentId: provinceA.id,
    id: generateUuid(rng),
    validUntil: null
  } satisfies Location

  const villageA = {
    name: 'Village A',
    locationType: LocationType.enum.ADMIN_STRUCTURE,
    parentId: districtA.id,
    id: generateUuid(rng),
    validUntil: null
  } satisfies Location

  const villageB = {
    name: 'Village B',
    locationType: LocationType.enum.ADMIN_STRUCTURE,
    parentId: provinceB.id,
    id: generateUuid(rng),
    validUntil: null
  } satisfies Location

  const administrativeAreas = [
    provinceA,
    provinceB,
    districtC,
    districtA,
    villageA,
    villageB
  ]

  await seed.locations(administrativeAreas)

  //2. Setup offices/health facilities under each admin area.
  const offices = generateOfficeLocations(administrativeAreas, rng)
  await seed.locations(offices)

  expect(administrativeAreas.length).toBe(6)
  expect(offices.length).toBe(12) // 6 admin areas x 2 offices each

  // 3. Create two users for each office to test 'user' scope limitations.
  const users = offices.flatMap((office, i) => {
    const base = {
      administrativeAreaId: administrativeAreas.find((aa) => {
        return aa.id === office.parentId
      })?.id,
      primaryOfficeId: office.id,
      fullHonorificName: `${office.name} full honorific name`
    }

    return [
      seed.user({
        ...base,
        name: [{ use: 'en', given: [`Mirella-${i}`], family: office.name }],
        role: pickRandom(rng, TestUserRole.options),
        id: generateUuid(rng)
      }),
      seed.user({
        ...base,
        name: [{ use: 'en', given: [`Jonathan-${i}`], family: office.name }],
        role: pickRandom(rng, TestUserRole.options),
        id: generateUuid(rng)
      })
    ]
  })

  const officeById = new Map(offices.map((o) => [o.id, o]))
  const administrativeAreaById = new Map(
    administrativeAreas.map((a) => [a.id, a])
  )

  // Helper to check if an office is under a given administrative area. Used for testing propositions.
  function isUnderAdministrativeArea(
    officeId: UUID,
    administrativeAreaId: UUID | null
  ): boolean {
    const current = officeById.get(officeId)
    if (!current) {
      return false
    }

    let parentId: UUID | null = current.parentId

    while (parentId) {
      if (parentId === administrativeAreaId) {
        return true
      }

      const parent = administrativeAreaById.get(parentId)
      parentId = parent?.parentId ?? null
    }

    return false
  }

  return {
    users,
    offices,
    administrativeAreas,
    isUnderAdministrativeArea
  }
}

test.only('Single scope, multi-filter cominations', async () => {
  const rng = createPrng(123453)
  const generator = payloadGenerator(rng)

  // 1. Create realistic hierarchy with users.
  const { users, offices, administrativeAreas, isUnderAdministrativeArea } =
    await setupHierarchyWithUsers()

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
          administrativeArea: administrativeAreas.find((aa) => {
            const office = offices.find((o) => o.id === user.primaryOfficeId)
            return aa.id === office?.parentId
          })?.id,
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
      numRuns: 200,
      verbose: true
    }
  )
})

test('multi-scope combinations', async () => {
  const rng = createPrng(1234)

  const generator = payloadGenerator(rng)
  // 1. Create realistic hierarchy with users.
  const { users, offices, administrativeAreas, isUnderAdministrativeArea } =
    await setupHierarchyWithUsers()

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
          administrativeArea: administrativeAreas.find((aa) => {
            const office = offices.find((o) => o.id === user.primaryOfficeId)
            return aa.id === office?.parentId
          })?.id,
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

        // 1. Strictest filter is applied only when the other all scopes have it. User should only see their own declarations when declaredBy=user filter is set on both.
        if (
          scope1.options.declaredBy === UserFilter.enum.user &&
          scope2.options.declaredBy === UserFilter.enum.user
        ) {
          for (const r of searchResult.results) {
            expect(r.legalStatuses.DECLARED?.createdBy).toBe(user.id)
          }
        }

        // 2. Loosest jurisdiction filter is applied when the other scope has a jurisdiction filter. User should see declarations from offices under the same administrative area when declaredIn=administrativeArea is set on either scope.
        if (
          scope1.options.declaredIn ===
            JurisdictionFilter.enum.administrativeArea ||
          scope2.options.declaredIn ===
            JurisdictionFilter.enum.administrativeArea
        ) {
          for (const r of searchResult.results) {
            const officeId = getOrThrow(
              r.legalStatuses.DECLARED?.createdAtLocation,
              'createdAtLocation is undefined'
            )

            expect(
              isUnderAdministrativeArea(officeId, user.administrativeAreaId)
            ).toBe(true)
          }
        }
      }
    ),
    {
      numRuns: 200,
      verbose: true
    }
  )
})
