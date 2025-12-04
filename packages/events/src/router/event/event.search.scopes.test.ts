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

import * as _ from 'lodash'
import {
  AddressType,
  JurisdictionFilter,
  Location,
  LocationType,
  TENNIS_CLUB_MEMBERSHIP,
  TestUserRole,
  createPrng,
  encodeScope,
  generateUuid,
  pickRandom
} from '@opencrvs/commons'
import {
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase
} from '@events/tests/utils'
import { payloadGenerator } from '../../tests/generators'

test.only('User without any search scopes should not see any events', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    'record.create[event=birth|death|tennis-club-membership|child-onboarding]',
    'record.read[event=birth|death|tennis-club-membership|child-onboarding]',
    'record.notify[event=birth|death|tennis-club-membership|child-onboarding]',
    'record.declare[event=birth|death|tennis-club-membership|child-onboarding]',
    encodeScope({
      type: 'record.search',
      options: {
        event: [TENNIS_CLUB_MEMBERSHIP],
        eventLocation: 'administrativeArea'
      }
    })
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
        administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
        streetLevelDetails: {
          state: 'state',
          district2: 'district2'
        }
      }
    }
  })

  await client.event.actions.declare.request(data)

  await client.event.search({
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
})

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

test.only('foo2', async () => {
  const { seed } = await setupTestCase()

  const rng = createPrng(1234)

  const generator = payloadGenerator(rng)

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

  const adminAreas = [
    provinceA,
    provinceB,
    districtC,
    districtA,
    villageA,
    villageB
  ]
  await seed.locations(adminAreas)

  const offices = generateOfficeLocations(adminAreas, rng)
  await seed.locations(offices)

  const users = offices.map((office) =>
    seed.user({
      administrativeAreaId: adminAreas.find((aa) => {
        return aa.id === office.parentId
      })?.id,
      primaryOfficeId: office.id,
      name: [{ use: 'en', given: ['Jonathan'], family: office.name }],
      role: pickRandom(rng, TestUserRole.options),
      id: generateUuid(rng),
      fullHonorificName: `${office.name} full honorific name`
    })
  )

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
          administrativeArea: adminAreas.find((aa) => {
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

  const cartesian = (...a: any[]) =>
    a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())))

  const combinations = cartesian(
    users, // user
    JurisdictionFilter.options, // eventLocation
    JurisdictionFilter.options // declaredIn
  )

  for (const [user, eventLocation, declaredIn] of combinations) {
    const searchScopes = [
      encodeScope({
        type: 'record.search',
        options: {
          event: [TENNIS_CLUB_MEMBERSHIP],
          eventLocation,
          declaredIn
        }
      })
    ]

    const testClient = createTestClient(user, searchScopes)

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

    expect({
      searchResult: sanitizeForSnapshot(searchResult, [
        'id',
        'createdAt',
        'updatedAt',
        'trackingId',
        'acceptedAt'
      ]),
      user,
      searchScopes
    }).toMatchSnapshot()
  }
})
