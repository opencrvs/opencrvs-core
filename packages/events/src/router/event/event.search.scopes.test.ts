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

import _ from 'lodash'
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
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { payloadGenerator } from '@events/tests/generators'

function generateOfficeLocations(
  adminAreas: Location[],
  rng: () => number
): Location[] {
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

test.only('Single scope, multi-filter combinations', async () => {
  const { seed } = await setupTestCase()

  const rng = createPrng(1234)

  const generator = payloadGenerator(rng)

  // 1. Setup administrative areas. 3 branches, some with children, some "skipping" levels.

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

  // 2. Setup offices/health facilities under each admin area.
  const offices = generateOfficeLocations(administrativeAreas, rng)
  await seed.locations(offices)

  expect(administrativeAreas.length).toBe(6)
  expect(offices.length).toBe(12) // 6 admin areas x 2 offices each

  // 3. Create user each office.
  const users = offices.map((office) =>
    seed.user({
      administrativeAreaId: administrativeAreas.find((aa) => {
        return aa.id === office.parentId
      })?.id,
      primaryOfficeId: office.id,
      name: [{ use: 'en', given: ['Jonathan'], family: office.name }],
      role: pickRandom(rng, TestUserRole.options),
      id: generateUuid(rng),
      fullHonorificName: `${office.name} full honorific name`
    })
  )

  // 4. Each user creates and declares an event using duplicate data.
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

        const officeById = new Map(offices.map((o) => [o.id, o]))

        const adminById = new Map(administrativeAreas.map((a) => [a.id, a]))

        function isUnderAdministrativeArea(
          officeId: UUID,
          adminAreaId: UUID | null
        ): boolean {
          const current = officeById.get(officeId)
          if (!current) {
            return false
          }

          let parentId = current.parentId

          while (parentId) {
            if (parentId === adminAreaId) {
              return true
            }

            const parent = adminById.get(parentId)
            parentId = parent?.parentId ?? null
          }

          return false
        }

        // 1. User should only see their own declarations when declaredBy=user filter is set.
        if (declaredBy === UserFilter.enum.user) {
          for (const r of results) {
            expect(r.legalStatuses.DECLARED?.createdBy).toBe(user.id)
          }
        }

        // 2. user should only see declarations from their exact location.
        if (declaredIn === JurisdictionFilter.enum.location) {
          for (const r of results) {
            expect(r.legalStatuses.DECLARED?.createdAtLocation).toBe(
              user.primaryOfficeId
            )
          }
        }

        // 3. user should see declarations from offices under the same administrative area.
        if (declaredIn === JurisdictionFilter.enum.administrativeArea) {
          for (const r of results) {
            expect(r.legalStatuses.DECLARED?.createdAtLocation).toBe(
              user.primaryOfficeId
            )

            const officeId = getOrThrow(
              r.legalStatuses.DECLARED?.createdAtLocation,
              'createdAtLocation is undefined'
            )

            const shouldBeVisible = isUnderAdministrativeArea(
              officeId,
              user.administrativeAreaId
            )

            expect(shouldBeVisible).toBe(true)
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

test('multi-scope combinations', async () => {
  const { seed } = await setupTestCase()

  const rng = createPrng(1234)

  const generator = payloadGenerator(rng)

  // 1. Setup administrative areas. 3 branches, some with children, some "skipping" levels.

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

  // 2. Setup offices/health facilities under each admin area.
  const offices = generateOfficeLocations(administrativeAreas, rng)
  await seed.locations(offices)

  expect(administrativeAreas.length).toBe(6)
  expect(offices.length).toBe(12) // 6 admin areas x 2 offices each

  // 3. Create user each office.
  const users = offices.map((office) =>
    seed.user({
      administrativeAreaId: administrativeAreas.find((aa) => {
        return aa.id === office.parentId
      })?.id,
      primaryOfficeId: office.id,
      name: [{ use: 'en', given: ['Jonathan'], family: office.name }],
      role: pickRandom(rng, TestUserRole.options),
      id: generateUuid(rng),
      fullHonorificName: `${office.name} full honorific name`
    })
  )

  // 4. Each user creates and declares an event using duplicate data.
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

  // 5. We generate combinations of users and jurisdiction filters to test search results.
  const cartesian = (...a: unknown[][]) =>
    a.reduce((b, c) =>
      b.flatMap((d: unknown) => c.map((e: unknown) => [d, e].flat()))
    )

  const combinations = cartesian(
    users, // user
    JurisdictionFilter.options, // declaredIn,
    [UserFilter.enum.user, undefined] // declaredBy
  ) as [
    (typeof users)[number],
    (typeof JurisdictionFilter.options)[number],
    typeof UserFilter.enum.user | undefined
  ][]

  const combinationResults = []

  // 6. Each user searches with each combination and we snapshot the results.
  for (const [user, declaredIn, declaredBy] of combinations) {
    const declaredInScope = encodeScope({
      type: 'record.search',
      options: {
        event: [TENNIS_CLUB_MEMBERSHIP],
        declaredIn
      }
    })

    const declaredByScope = encodeScope({
      type: 'record.search',
      options: {
        event: [TENNIS_CLUB_MEMBERSHIP],
        declaredBy
      }
    })

    const scopes = [declaredInScope, declaredByScope]

    const testClient = createTestClient(user, scopes)

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

    // 7. We want to see 1) jurisdiction scope limits search results. 2) combining jurisdiction filter and user is treated as AND.
    const cleanedResults = searchResult.results.map((r) => ({
      type: r.type,
      legalStatuses: {
        DECLARED: {
          createdAtLocation: r.legalStatuses.DECLARED?.createdAtLocation,
          readableLocation: offices.find(
            (o) => o.id === r.legalStatuses.DECLARED?.createdAtLocation
          )?.name,
          createdBy: r.legalStatuses.DECLARED?.createdBy
        }
      }
    }))

    const snapshot = {
      scopes: `[${scopes.join(', ')}]`,
      total: cleanedResults.length,
      user: {
        id: user.id,
        primaryOfficeId: user.primaryOfficeId,
        administrativeAreaId: user.administrativeAreaId,
        locations: `${offices.find((o) => o.id === user.primaryOfficeId)?.name}, ${
          administrativeAreas.find((aa) => aa.id === user.administrativeAreaId)
            ?.name
        }`
      },
      results: cleanedResults
    }

    combinationResults.push(snapshot)
  }

  // Group by scope for easier snapshot reading
  const resultsByScopes = _.groupBy(combinationResults, (r) => r.scopes)

  expect(resultsByScopes).toMatchSnapshot()
})
