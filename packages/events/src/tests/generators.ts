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
  DeclareActionInput,
  EventInput,
  getUUID,
  ActionType,
  ValidateActionInput,
  RegisterActionInput,
  RequestCorrectionActionInput,
  mapFieldTypeToMockValue,
  EventConfig,
  findActiveActionFields,
  stripHiddenOrDisabledFields,
  eventPayloadGenerator
} from '@opencrvs/commons'
import { Location } from '@events/service/locations/locations'
import { Db } from 'mongodb'

interface Name {
  use: string
  given: string[]
  family: string
}

export interface CreatedUser {
  id: string
  primaryOfficeId: string
  role: string
  name: Array<Name>
}

interface CreateUser {
  primaryOfficeId: string
  role?: string
  name?: Array<Name>
}

/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function payloadGenerator() {
  const user = {
    create: (input: CreateUser) => ({
      role: input.role ?? 'REGISTRATION_AGENT',
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
          externalId: getUUID(),
          partOf: null
        }))
      }

      return input.map((location, i) => ({
        id: location.id ?? getUUID(),
        name: location.name ?? `Location name ${i}`,
        externalId: location.externalId ?? getUUID(),
        partOf: null
      }))
    }
  }

  return { event: eventPayloadGenerator, locations, user }
}

/**
 * Helper utility to seed data into the database.
 * Use with payloadGenerator for creating test data.
 */
export function seeder() {
  const seedUser = async (db: Db, user: Omit<CreatedUser, 'id'>) => {
    const createdUser = await db.collection('users').insertOne(user)

    return {
      primaryOfficeId: user.primaryOfficeId,
      name: user.name,
      role: user.role,
      id: createdUser.insertedId.toString()
    }
  }
  const seedLocations = async (db: Db, locations: Location[]) =>
    db.collection('locations').insertMany(locations)

  return {
    user: seedUser,
    locations: seedLocations
  }
}
