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

import { Db } from 'mongodb'
import { Kysely } from 'kysely'
import {
  getUUID,
  eventPayloadGenerator,
  EventDocument,
  ActionType,
  ActionStatus,
  UUID
} from '@opencrvs/commons'
import { Location, setLocations } from '@events/service/locations/locations'
import { generateTrackingId } from '../service/events/events'
import AppSchema from '../storage/postgres/events/schema/app/AppSchema'

interface Name {
  use: string
  given: string[]
  family: string
}

export interface CreatedUser {
  id: string
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
export function payloadGenerator(rng: () => number) {
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

  return { event: eventPayloadGenerator(rng), locations, user }
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
  const seedLocations = async (locations: Location[]) => setLocations(locations)

  const seedEvent = async (
    db: Kysely<AppSchema>,
    user: CreatedUser & { signature?: string },
    event: Partial<EventDocument> = {}
  ) => {
    const now = new Date().toISOString()
    const id = getUUID()
    const transactionId = getUUID()
    const trackingId = generateTrackingId()

    const createdByDetails = {
      createdBy: user.id,
      createdByRole: user.role,
      createdAtLocation: user.primaryOfficeId,
      createdBySignature: user.signature
    }

    await db
      .insertInto('events')
      // @ts-expect-error -- @todo: check the inference
      .values({
        id,
        transactionId,
        createdAt: now,
        updatedAt: now,
        trackingId,
        actions: [
          {
            ...createdByDetails,
            type: ActionType.CREATE,
            createdAt: now,
            id: getUUID(),
            declaration: {},
            status: ActionStatus.Accepted,
            transactionId: getUUID()
          }
        ],
        ...event
      })
      .execute()
  }

  return {
    user: seedUser,
    locations: seedLocations,
    event: seedEvent
  }
}
