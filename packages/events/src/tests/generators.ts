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
  ValidateActionInput
} from '@opencrvs/commons'
import { Location } from '@events/service/locations/locations'
import { Db } from 'mongodb'

type Name = {
  use: string
  given: string[]
  family: string
}

export type CreatedUser = {
  id: string
  primaryOfficeId: string
  systemRole: string
  name: Array<Name>
}

type CreateUser = {
  primaryOfficeId: string
  systemRole?: string
  name?: Array<Name>
}
/**
 * @returns a payload generator for creating events and actions with sensible defaults.
 */
export function payloadGenerator() {
  const event = {
    create: (input: Partial<EventInput> = {}) => ({
      transactionId: input?.transactionId ?? getUUID(),
      type: input?.type ?? 'TENNIS_CLUB_MEMBERSHIP'
    }),
    patch: (id: string, input: Partial<EventInput> = {}) => ({
      transactionId: input?.transactionId ?? getUUID(),
      type: input?.type ?? 'TENNIS_CLUB_MEMBERSHIP',
      id
    }),
    actions: {
      declare: (
        eventId: string,
        input: Partial<Pick<DeclareActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.DECLARE,
        transactionId: input?.transactionId ?? getUUID(),
        data: input?.data ?? {},
        eventId
      }),
      validate: (
        eventId: string,
        input: Partial<Pick<ValidateActionInput, 'transactionId' | 'data'>> = {}
      ) => ({
        type: ActionType.VALIDATE,
        transactionId: input?.transactionId ?? getUUID(),
        data: input?.data ?? {},
        eventId
      })
    }
  }

  const user = {
    create: (input: CreateUser) => ({
      systemRole: input?.systemRole ?? 'REGISTRATION_AGENT',
      name: input?.name ?? [{ use: 'en', family: 'Doe', given: ['John'] }],
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

  return { event, locations, user }
}

/**
 * Helper utility to seed data into the database.
 * Use with payloadGenerator for creating test data.
 */
export function seeder() {
  const seedUser = async (db: Db, user: Omit<CreatedUser, 'id'>) => {
    const createdUser = await db.collection('users').insertOne(user)

    return {
      ...user,
      id: createdUser.insertedId.toString()
    }
  }
  const seedLocations = (db: Db, locations: Location[]) =>
    db.collection('locations').insertMany(locations)

  return {
    user: seedUser,
    locations: seedLocations
  }
}
