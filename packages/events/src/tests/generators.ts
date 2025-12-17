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
  createPrng
} from '@opencrvs/commons'
import { setLocations } from '../service/locations/locations'

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
          parentId: null,
          validUntil: null,
          locationType: pickRandom(prng, LocationType.options)
        })) as Location[]
      }

      return input.map((location, i) => ({
        id: location.id ?? generateUuid(prng),
        name: location.name ?? `Location name ${i}`,
        parentId: location.parentId ?? null,
        validUntil: null,
        locationType: LocationType.enum.ADMIN_STRUCTURE
      })) as Location[]
    }
  }

  return { event: eventPayloadGenerator(rng, configuration), locations, user }
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
  const seedLocations = async (locations: Location[]) =>
    setLocations(
      locations.map((location) => ({
        ...location,
        validUntil: location.validUntil ? location.validUntil : null
      }))
    )

  return {
    user: seedUser,
    locations: seedLocations
  }
}

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
export async function setupHierarchyWithUsers() {
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

  const officeById = new Map(offices.map((o) => [o.id, o]))
  const administrativeAreaById = new Map(
    administrativeAreas.map((a) => [a.id, a])
  )

  // 3. Create two users for each office to test 'user' scope limitations.
  const users = offices.flatMap((office, i) => {
    const base = {
      administrativeAreaId: office.parentId,
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
    isUnderAdministrativeArea,
    administrativeAreaById,
    officeById
  }
}
