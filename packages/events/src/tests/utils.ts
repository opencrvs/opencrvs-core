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
import { times, flatten, constant } from 'lodash'
import * as jwt from 'jsonwebtoken'
import {
  ActionType,
  createPrng,
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
import { SystemContext } from '@events/context'
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
  'createdByUserType',
  'createdAtLocation',
  'assignedTo',
  'updatedAtLocation',
  'updatedBy',
  'acceptedAt',
  'dateOfEvent'
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
  SCOPES.SEARCH_BIRTH,
  'workqueue[id=assigned-to-you|recent|requires-updates|sent-for-review]'
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
  scopes: string[] = TEST_USER_DEFAULT_SCOPES
) {
  const createCaller = createCallerFactory(appRouter)
  const token = createTestToken(systemId, scopes, TokenUserType.enum.system)

  const caller = createCaller({
    user: SystemContext.parse({
      id: systemId,
      role: SystemRole.enum.HEALTH,
      primaryOfficeId: undefined,
      type: TokenUserType.enum.system
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
export const setupTestCase = async (rngSeed?: number) => {
  const rng = createPrng(rngSeed ?? 101)
  const generator = payloadGenerator(rng)
  const eventsDb = await events.getClient()
  const userMgntDb = await userMgnt.getClient()

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

/**
 *
 * @param client trpc client
 * @param generator payload generator
 * @param action action to be performed on the event
 * @returns corresponding client action method for the given action type, with prefilled payload
 */
function actionToClientAction(
  client: ReturnType<typeof createTestClient>,
  generator: ReturnType<typeof payloadGenerator>,
  action: ActionType
) {
  //
  switch (action) {
    case ActionType.CREATE:
      return async () => client.event.create(generator.event.create())
    case ActionType.DECLARE:
      return async (eventId: string) =>
        client.event.actions.declare.request(
          generator.event.actions.declare(eventId, { keepAssignment: true })
        )
    case ActionType.VALIDATE:
      return async (eventId: string) =>
        client.event.actions.validate.request(
          generator.event.actions.validate(eventId, { keepAssignment: true })
        )
    case ActionType.REJECT:
      return async (eventId: string) =>
        client.event.actions.reject.request(
          generator.event.actions.reject(eventId, { keepAssignment: true })
        )
    case ActionType.ARCHIVE:
      return async (eventId: string) =>
        client.event.actions.archive.request(
          generator.event.actions.archive(eventId, { keepAssignment: true })
        )
    case ActionType.REGISTER:
      return async (eventId: string) =>
        client.event.actions.register.request(
          generator.event.actions.register(eventId, { keepAssignment: true })
        )
    case ActionType.PRINT_CERTIFICATE:
      return async (eventId: string) =>
        client.event.actions.printCertificate.request(
          generator.event.actions.printCertificate(eventId, {
            keepAssignment: true
          })
        )

    case ActionType.NOTIFY:
    case ActionType.DETECT_DUPLICATE:
    case ActionType.REQUEST_CORRECTION:
    case ActionType.APPROVE_CORRECTION:
    case ActionType.ASSIGN:
    case ActionType.UNASSIGN:
    case ActionType.MARKED_AS_DUPLICATE:
    case ActionType.REJECT_CORRECTION:
    case ActionType.DELETE:
    case ActionType.READ:
    default:
      throw new Error(
        `Unsupported action type: ${action}. Create a case for it if you need it.`
      )
  }
}

/**
 * Create event based on actions to be used in tests.
 * Created through API to make sure it get indexed properly. (To seed directly to database we need: https://github.com/opencrvs/opencrvs-core/issues/8884)
 */
export async function createEvent(
  client: ReturnType<typeof createTestClient>,
  generator: ReturnType<typeof payloadGenerator>,
  actions: ActionType[]
) {
  let createdEvent: Awaited<ReturnType<typeof client.event.create>> | undefined

  for (const action of actions) {
    const clientAction = actionToClientAction(client, generator, action)

    if (action === ActionType.CREATE) {
      // @ts-expect-error -- createEvent does not accept any arguments
      createdEvent = await clientAction()
    } else if (!createdEvent) {
      throw new Error('Event must be created before performing actions on it')
    } else {
      await clientAction(createdEvent.id)
    }
  }
}

/**
 * Returns ordered combinations of actions, starting with single action and growing to the full set.
 * Useful for generating test combinations based on a set of actions.
 *
 * @example getGrowingCombinations(['a', 'b', 'c']) --> [['a'], ['a', 'b'], ['a', 'b', 'c']]
 * @example getGrowingCombinations(['a', 'b', 'c'], 2) --> [['a'], ['a'], ['a', 'b'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c']
 *
 */
export function getGrowingCombinations<T>(arr: T[], count: number = 1): T[][] {
  if (count < 1) {
    throw new Error('Count must be a positive integer')
  }

  const combination = arr.map((_, i) => arr.slice(0, i + 1))

  // flatten out and duplicate the combinations as many time as needed.
  return flatten(times(count, constant(combination)))
}
