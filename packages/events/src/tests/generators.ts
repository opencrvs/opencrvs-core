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
  pickRandom
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
  const seedUser = (user: Omit<CreatedUser, 'id'>) => {
    return {
      primaryOfficeId: user.primaryOfficeId,
      name: user.name,
      fullHonorificName: user.fullHonorificName,
      role: user.role as TestUserRole,
      id: getUUID()
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
