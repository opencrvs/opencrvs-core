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
  getUUID,
  eventPayloadGenerator,
  UUID,
  TestUserRole,
  EventConfig,
  Location,
  LocationType,
  generateUuid,
  pickRandom,
  createPrng,
  generateTrackingId,
  AdministrativeArea
} from '@opencrvs/commons'
import { setLocations } from '../service/locations/locations'
import { setAdministrativeAreas } from '../service/administrative-areas'

interface Name {
  use: string
  given: string[]
  family: string
}

export interface CreatedUser {
  id: UUID
  primaryOfficeId: UUID
  role: string
  name: Array<Name>
  fullHonorificName?: string
}

interface CreateUser {
  primaryOfficeId: UUID
  administrativeAreaId?: UUID | null
  role?: string
  name?: Array<Name>
  fullHonorificName?: string
}

/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function payloadGenerator(
  rng: () => number,
  configuration?: EventConfig
) {
  const user = {
    create: (input: CreateUser) => ({
      role: input.role ?? TestUserRole.enum.REGISTRATION_AGENT,
      name: input.name ?? [{ use: 'en', family: 'Doe', given: ['John'] }],
      primaryOfficeId: input.primaryOfficeId,
      administrativeAreaId: input.administrativeAreaId,
      fullHonorificName: input.fullHonorificName
    })
  }

  const locations = {
    /** Create test data by providing count or desired locations */
    set: (input: Array<Partial<Location>> | number, prng: () => number) => {
      if (typeof input === 'number') {
        return Array.from({ length: input }).map((_, i) => ({
          id: generateUuid(prng),
          name: `Location name ${i}`,
          administrativeAreaId: null,
          validUntil: null,
          externalId: generateTrackingId(prng) + generateTrackingId(prng),
          locationType: pickRandom(prng, [
            LocationType.enum.CRVS_OFFICE,
            LocationType.enum.HEALTH_FACILITY
          ])
        })) satisfies Location[]
      }

      return input.map((location, i) => ({
        id: location.id ?? generateUuid(prng),
        name: location.name ?? `Location name ${i}`,
        administrativeAreaId: location.administrativeAreaId ?? null,
        validUntil: null,
        externalId:
          location.externalId ??
          generateTrackingId(prng) + generateTrackingId(prng),
        locationType: LocationType.enum.CRVS_OFFICE
      })) as Location[]
    }
  }

  const administrativeAreas = {
    /** Create test data by providing count or desired administrativeAreas */
    set: (
      input: Array<Partial<AdministrativeArea>> | number,
      prng: () => number
    ) => {
      if (typeof input === 'number') {
        return Array.from({ length: input }).map((_, i) => ({
          id: generateUuid(prng),
          name: `Location name ${i}`,
          parentId: null,
          validUntil: null,
          externalId: generateTrackingId(prng) + generateTrackingId(prng)
        })) satisfies AdministrativeArea[]
      }

      return input.map((administrativeArea, i) => ({
        id: administrativeArea.id ?? generateUuid(prng),
        name: administrativeArea.name ?? `administrativeArea name ${i}`,
        parentId: administrativeArea.parentId ?? null,
        validUntil: null,
        externalId:
          administrativeArea.externalId ??
          generateTrackingId(prng) + generateTrackingId(prng)
      })) satisfies AdministrativeArea[]
    }
  }

  return {
    event: eventPayloadGenerator(rng, configuration),
    locations,
    administrativeAreas,
    user
  }
}

/**
 * Helper utility to seed data into the database.
 * Use with payloadGenerator for creating test data.
 */
export function seeder() {
  const seedUser = (
    user: Omit<CreatedUser, 'id'> & {
      id?: UUID
      administrativeAreaId?: UUID | null
    }
  ) => {
    return {
      primaryOfficeId: user.primaryOfficeId,
      administrativeAreaId: user.administrativeAreaId ?? null,
      name: user.name,
      fullHonorificName: user.fullHonorificName,
      role: user.role as TestUserRole,
      id: user.id ?? getUUID()
    }
  }
  const seedLocations = async (locations: Location[]) => setLocations(locations)

  const seedAdministrativeAreas = async (
    administrativeAreas: AdministrativeArea[]
  ) => setAdministrativeAreas(administrativeAreas)
  return {
    user: seedUser,
    locations: seedLocations,
    administrativeAreas: seedAdministrativeAreas
  }
}

/**
 * Creates test locations (CRVS offices and Health Facilities) under each provided administrative area.
 */
function generateTestLocations(
  administrativeAreas: AdministrativeArea[],
  rng: () => number
): Location[] {
  return administrativeAreas.flatMap((admin) => {
    const crvs = {
      name: `${admin.name} CRVS Office`,
      locationType: LocationType.enum.CRVS_OFFICE,
      administrativeAreaId: admin.id,
      id: generateUuid(rng),
      validUntil: null,
      externalId: generateUuid(rng)
    } satisfies Location

    const health = {
      name: `${admin.name} Health Facility`,
      locationType: LocationType.enum.HEALTH_FACILITY,
      administrativeAreaId: admin.id,
      id: generateUuid(rng),
      validUntil: null,
      externalId: generateUuid(rng)
    } satisfies Location

    return [crvs, health]
  })
}

function generateTestAdministrativeAreas() {
  const rng = createPrng(12345)
  // Generate Administrative areas with children, some "skipping" levels.
  const provinceA = {
    name: 'Province A',
    parentId: null,
    id: generateUuid(rng),
    validUntil: null,
    externalId: generateUuid(rng)
  } satisfies AdministrativeArea

  const provinceB = {
    name: 'Province B',
    parentId: null,
    id: generateUuid(rng),
    validUntil: null,
    externalId: generateUuid(rng)
  } satisfies AdministrativeArea

  const districtC = {
    name: 'District C',
    parentId: null,
    id: generateUuid(rng),
    validUntil: null,
    externalId: generateUuid(rng)
  } satisfies AdministrativeArea

  const districtA = {
    name: 'District A',
    parentId: provinceA.id,
    id: generateUuid(rng),
    validUntil: null,
    externalId: generateUuid(rng)
  } satisfies AdministrativeArea

  const villageA = {
    name: 'Village A',
    parentId: districtA.id,
    id: generateUuid(rng),
    validUntil: null,
    externalId: generateUuid(rng)
  } satisfies AdministrativeArea

  const villageB = {
    name: 'Village B',
    parentId: provinceB.id,
    id: generateUuid(rng),
    validUntil: null,
    externalId: generateUuid(rng)
  } satisfies AdministrativeArea

  const administrativeAreas = [
    provinceA,
    provinceB,
    districtC,
    districtA,
    villageA,
    villageB
  ]

  return administrativeAreas
}

/**
 * Creates a pair of test users for each provided location.
 *
 */
function generateTestUsersForLocations(
  locations: Location[],
  rng: () => number
) {
  // 3. Create two users for each office to test 'user' scope limitations.
  const users = locations.flatMap((location, i) => {
    const base = {
      administrativeAreaId: location.administrativeAreaId,
      primaryOfficeId: location.id,
      fullHonorificName: `${location.name} full honorific name`
    }

    return [
      {
        ...base,
        name: [{ use: 'en', given: [`Mirella-${i}`], family: location.name }],
        role: pickRandom(rng, TestUserRole.options),
        id: generateUuid(rng)
      },
      {
        ...base,
        name: [{ use: 'en', given: [`Jonathan-${i}`], family: location.name }],
        role: pickRandom(rng, TestUserRole.options),
        id: generateUuid(rng)
      }
    ]
  })

  return users
}
/**
 * Sets up a realistic hierarchy of administrative areas, offices, and users for testing scopes.
 * Each location has two users assigned to it. Hiearchies include cases where some levels are skipped or do not exist.
 *
 */
export async function setupHierarchyWithUsers() {
  const rng = createPrng(1234)
  const seed = seeder()

  // Generate Administrative areas with children, some "skipping" levels.
  const administrativeAreas = generateTestAdministrativeAreas()

  await seed.administrativeAreas(administrativeAreas)

  //2. Setup offices/health facilities under each admin area.
  const locations = generateTestLocations(administrativeAreas, rng)
  await seed.locations(locations)

  expect(administrativeAreas.length).toBe(6)
  expect(locations.length).toBe(12) // 6 admin areas x 2 offices each

  const locationById = new Map(locations.map((o) => [o.id, o]))
  const administrativeAreaById = new Map(
    administrativeAreas.map((a) => [a.id, a])
  )

  // 3. Create two users for each office to test 'user' scope limitations.
  const users = generateTestUsersForLocations(locations, rng)

  // Helper to check if an office is under a given administrative area. Used for testing propositions.
  function isUnderAdministrativeArea(
    locationId: UUID,
    administrativeAreaId: UUID | null | undefined
  ): boolean {
    const current = locationById.get(locationId)
    if (!current) {
      return false
    }

    let locationAdministrativeAreaId: UUID | null | undefined =
      current.administrativeAreaId

    while (locationAdministrativeAreaId) {
      if (locationAdministrativeAreaId === administrativeAreaId) {
        return true
      }

      const parent = administrativeAreaById.get(locationAdministrativeAreaId)
      locationAdministrativeAreaId = parent?.parentId ?? null
    }

    return false
  }

  return {
    users,
    locations,
    administrativeAreas,
    isUnderAdministrativeArea,
    administrativeAreaById,
    locationById
  }
}
