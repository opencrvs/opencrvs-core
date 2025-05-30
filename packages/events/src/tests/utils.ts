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

import { readFileSync } from 'fs'
import { join } from 'path'
import * as jwt from 'jsonwebtoken'
import {
  createPseudoRandomNumberGenerator,
  generateRandomSignature,
  Scope,
  SCOPES,
  SystemRole,
  TokenUserType,
  TokenWithBearer
} from '@opencrvs/commons'
import { t } from '@events/router/trpc'
import { appRouter } from '@events/router/router'
import * as events from '@events/storage/mongodb/__mocks__/events'
import * as userMgnt from '@events/storage/mongodb/__mocks__/user-mgnt'
import { UserContext } from '@events/context'
import { CreatedUser, payloadGenerator, seeder } from './generators'

/**
 * Known unstable fields in events that should be sanitized for snapshot testing.
 * We should aim to have stable ids based on the actual users and events in the system.
 */
export const UNSTABLE_EVENT_FIELDS = [
  'createdAt',
  'updatedAt',
  'transactionId',
  'id',
  'trackingId',
  'eventId',
  'createdBy',
  'createdAtLocation',
  'assignedTo'
]
/**u
 * Cleans up unstable fields in data for snapshot testing.
 *
 * @param data - The data to sanitize
 * @param options - fields to sanitize and replacement value for them
 *
 * @example sanitizeForSnapshot({
 *   name: 'John Doe',
 *   createdAt: '2023-10-01T12:00:00Z'
 * }, { fields: ['createdAt'] })
 * // → { name: 'John Doe', createdAt: '[sanitized]' }
 */
export function sanitizeForSnapshot(data: unknown, fields: string[]) {
  const replacement = '[sanitized]'
  const keyMatches = (key: string) => fields.includes(key)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitize = (value: unknown): any => {
    if (Array.isArray(value)) {
      return value.map(sanitize)
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
          key,
          keyMatches(key) ? replacement : sanitize(val)
        ])
      )
    }

    return value
  }

  return sanitize(data)
}

const { createCallerFactory } = t

export const TEST_USER_DEFAULT_SCOPES = [
  SCOPES.RECORD_DECLARE,
  SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
  SCOPES.RECORD_READ,
  SCOPES.RECORD_REGISTER,
  SCOPES.RECORD_REGISTRATION_CORRECT,
  SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION,
  SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
  SCOPES.RECORD_DECLARATION_ARCHIVE,
  SCOPES.RECORD_SUBMIT_FOR_UPDATES,
  SCOPES.RECORD_UNASSIGN_OTHERS,
  SCOPES.SEARCH_BIRTH
]

export function createTestToken(
  userId: string,
  scopes: Scope[],
  userType: TokenUserType = TokenUserType.enum.user
): TokenWithBearer {
  const token = jwt.sign(
    { scope: scopes, sub: userId, userType },
    readFileSync(join(__dirname, './cert.key')),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:events-user'
    }
  )

  return `Bearer ${token}`
}

export function createSystemTestClient(
  systemId: string,
  scopes: string[] = TEST_USER_DEFAULT_SCOPES,
  seed?: number
) {
  const rng = createPseudoRandomNumberGenerator(seed ?? 101)
  const createCaller = createCallerFactory(appRouter)
  const token = createTestToken(systemId, scopes, TokenUserType.enum.system)

  const caller = createCaller({
    user: UserContext.parse({
      id: systemId,
      role: SystemRole.enum.HEALTH,
      primaryOfficeId: undefined,
      type: TokenUserType.enum.system,
      signature: generateRandomSignature(rng)
    }),
    token
  })

  return caller
}

export function createTestClient(
  user: CreatedUser,
  scopes: string[] = TEST_USER_DEFAULT_SCOPES
) {
  const createCaller = createCallerFactory(appRouter)
  const token = createTestToken(user.id, scopes)

  const caller = createCaller({
    user: {
      ...user,
      type: TokenUserType.enum.user
    },
    token
  })
  return caller
}

/**
 *  Setup for test cases. Creates a user and locations in the database, and provides relevant client instances and seeders.
 */
export const setupTestCase = async () => {
  const generator = payloadGenerator()
  const eventsDb = await events.getClient()
  const userMgntDb = await userMgnt.getClient()

  const rng = createPseudoRandomNumberGenerator(101)

  const seed = seeder()
  const locations = generator.locations.set(5)
  await seed.locations(eventsDb, locations)

  const user = await seed.user(
    userMgntDb,
    generator.user.create({
      primaryOfficeId: locations[0].id
    })
  )

  return {
    locations,
    user: {
      ...user,
      signature: generateRandomSignature(rng)
    },
    eventsDb,
    userMgntDb,
    seed,
    generator
  }
}
