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
  EventConfig
} from '@opencrvs/commons'
import { Location } from '@events/service/locations/locations'
import { addLocations } from '@events/storage/postgres/events/locations'

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
}

interface CreateUser {
  primaryOfficeId: UUID
  role?: string
  name?: Array<Name>
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
      role: input.role ?? ('REGISTRATION_AGENT' as TestUserRole),
      name: input.name ?? [{ use: 'en', family: 'Doe', given: ['John'] }],
      primaryOfficeId: input.primaryOfficeId
    })
  }

  const locations = {
    /** Create test data by providing count or desired locations */
    set: (input: Array<Partial<Location>> | number) => {
      if (typeof input === 'number') {
        return Array.from({ length: input }).map((_, i) => ({
          id: getUUID(),
          name: `Location name ${i}`,
          parentId: null,
          validUntil: null,
          locationType: 'ADMIN_STRUCTURE'
        })) as Location[]
      }

      return input.map((location, i) => ({
        id: location.id ?? getUUID(),
        name: location.name ?? `Location name ${i}`,
        parentId: location.parentId ?? null,
        validUntil: null,
        locationType: 'ADMIN_STRUCTURE'
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
      role: user.role as TestUserRole,
      id: getUUID()
    }
  }
  const seedLocations = async (locations: Location[]) =>
    addLocations(
      locations.map((location) => ({
        ...location,
        validUntil: location.validUntil
          ? location.validUntil.toISOString()
          : null
      }))
    )

  return {
    user: seedUser,
    locations: seedLocations
  }
}
