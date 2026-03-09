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
/* eslint-disable max-lines */
import { readFileSync } from 'fs'
import { join } from 'path'
import * as jwt from 'jsonwebtoken'
import fc from 'fast-check'
import {
  ActionStatus,
  ActionType,
  ActionTypes,
  ActionUpdate,
  AdministrativeArea,
  createPrng,
  DeclarationActionType,
  encodeScope,
  EventConfig,
  EventDocument,
  EventIndex,
  generateActionDeclarationInput,
  generateRandomDatetime,
  generateRandomSignature,
  generateRegistrationNumber,
  generateUuid,
  getCurrentEventState,
  getUUID,
  JurisdictionFilter,
  Location,
  Scope,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP,
  TokenUserType,
  TokenWithBearer,
  UserFilter,
  UUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { t } from '@events/router/trpc'
import { appRouter } from '@events/router/router'
import { SystemContext, UserContext } from '@events/context'
import { getClient } from '@events/storage/postgres/events'
import { EventNotFoundError } from '@events/service/events/events'
import { getLocations } from '../service/locations/locations'
import { NewEventActions } from '../storage/postgres/events/schema/app/EventActions'
import {
  CreatedUser,
  payloadGenerator,
  seeder,
  setupHierarchyWithUsers
} from './generators'

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
  'dateOfEvent',
  'placeOfEvent',
  'registrationNumber',
  'originalActionId'
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
  SCOPES.SEARCH_BIRTH,
  'workqueue[id=assigned-to-you|recent|requires-updates|sent-for-review]',
  encodeScope({
    type: 'record.read',
    options: {
      event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding']
    }
  }),
  encodeScope({
    type: 'record.create',
    options: {
      event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding']
    }
  }),
  encodeScope({
    type: 'record.notify',
    options: {
      event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding']
    }
  }),
  encodeScope({
    type: 'record.declare',
    options: {
      event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding']
    }
  }),
  'record.declared.edit[event=birth|death|tennis-club-membership|child-onboarding]',
  'record.declared.reject[event=birth|death|tennis-club-membership|child-onboarding]',
  'record.declared.archive[event=birth|death|tennis-club-membership|child-onboarding]',
  encodeScope({
    type: 'record.register',
    options: {
      event: ['birth', 'death', 'tennis-club-membership', 'child-onboarding']
    }
  }),

  'record.registered.print-certified-copies[event=birth|death|tennis-club-membership|child-onboarding]',
  'record.registered.request-correction[event=birth|death|tennis-club-membership|child-onboarding]',
  'record.registered.correct[event=birth|death|tennis-club-membership|child-onboarding]',
  'record.unassign-others[event=birth|death|tennis-club-membership|child-onboarding]'
]

export function createTestToken({
  userId,
  scopes,
  userType,
  role
}: {
  userId: string
  scopes: Scope[]
  userType?: TokenUserType
  role?: string
}): TokenWithBearer {
  const token = jwt.sign(
    { scope: scopes, sub: userId, userType, role },
    readFileSync(join(__dirname, './cert.key')),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:events-user'
    }
  )

  return `Bearer ${token}`
}

function createTokenExchangeTestToken(
  userId: string,
  eventId: string,
  actionId: string
): TokenWithBearer {
  const token = jwt.sign(
    {
      scope: [
        SCOPES.RECORD_CONFIRM_REGISTRATION,
        SCOPES.RECORD_REJECT_REGISTRATION
      ],
      sub: userId,
      userType: TokenUserType.enum.user,
      eventId,
      actionId
    },
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
  const token = createTestToken({
    userId: systemId,
    scopes,
    userType: TokenUserType.enum.system
  })

  const caller = createCaller({
    user: SystemContext.parse({
      id: systemId,
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
  const token = createTestToken({
    userId: user.id,
    scopes,
    userType: TokenUserType.enum.user,
    role: user.role
  })

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
 * The token that is passed to country config needs to have been exchanged for the specific eventId and actionId.
 */
export function createCountryConfigClient(
  user: CreatedUser,
  eventId: string,
  actionId: string
) {
  const createCaller = createCallerFactory(appRouter)
  const token = createTokenExchangeTestToken(user.id, eventId, actionId)

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
export const setupTestCase = async (
  rngSeed?: number,
  configuration?: EventConfig
) => {
  const rng = createPrng(rngSeed ?? 101)
  const generator = payloadGenerator(rng, configuration)
  const eventsDb = getClient()

  const seed = seeder()
  const locationRng = createPrng(10123)

  const administrativeAreaPayload = generator.administrativeAreas.set(
    5,
    locationRng
  )
  await seed.administrativeAreas(administrativeAreaPayload)
  await seed.locations(
    generator.locations.set(
      administrativeAreaPayload.map((area) => ({
        administrativeAreaId: area.id
      })),
      locationRng
    )
  )

  const locations = await getLocations()

  const defaultUser = seed.user(
    generator.user.create({
      primaryOfficeId: locations[0].id,
      administrativeAreaId: locations[0].administrativeAreaId
    })
  )
  const secondaryUser = seed.user(
    generator.user.create({
      primaryOfficeId: locations[1].id,
      administrativeAreaId: locations[1].administrativeAreaId
    })
  )

  const users = [defaultUser, secondaryUser]

  return {
    locations,
    user: {
      ...defaultUser,
      signature: generateRandomSignature(rng)
    },
    eventsDb,
    users,
    rng,
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
  action: Extract<ActionType, 'CREATE'>
): () => Promise<EventDocument>
function actionToClientAction(
  client: ReturnType<typeof createTestClient>,
  generator: ReturnType<typeof payloadGenerator>,
  action: Exclude<ActionType, 'CREATE'>
): (eventId: string) => Promise<EventDocument>
function actionToClientAction(
  client: ReturnType<typeof createTestClient>,
  generator: ReturnType<typeof payloadGenerator>,
  action: ActionType
):
  | (() => Promise<EventDocument>)
  | ((eventId: string) => Promise<EventDocument>) {
  switch (action) {
    case ActionType.CREATE:
      return async () => client.event.create(generator.event.create())
    case ActionType.DECLARE:
      return async (eventId: string) =>
        client.event.actions.declare.request(
          generator.event.actions.declare(eventId, { keepAssignment: true })
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
          generator.event.actions.register(eventId, {
            keepAssignment: true
          })
        )
    case ActionType.PRINT_CERTIFICATE:
      return async (eventId: string) =>
        client.event.actions.printCertificate.request(
          generator.event.actions.printCertificate(eventId, {
            keepAssignment: true
          })
        )
    case ActionType.REQUEST_CORRECTION:
      return async (eventId: string) =>
        client.event.actions.correction.request.request(
          generator.event.actions.correction.request(eventId, {
            keepAssignment: true
          })
        )

    case ActionType.NOTIFY:
    case ActionType.DUPLICATE_DETECTED:
    case ActionType.APPROVE_CORRECTION:
    case ActionType.ASSIGN:
    case ActionType.UNASSIGN:
    case ActionType.MARK_AS_NOT_DUPLICATE:
    case ActionType.MARK_AS_DUPLICATE:
    case ActionType.REJECT_CORRECTION:
    case ActionType.DELETE:
    case ActionType.CUSTOM:
    case ActionType.READ:
    case ActionType.EDIT:
    default:
      throw new Error(
        `Unsupported action type: ${action}. Create a case for it if you need it.`
      )
  }
}

/**
 * Create event based on actions to be used in tests.
 * Created through API to make sure it get indexed properly.

 * To seed directly to database we need:
 * https://github.com/opencrvs/opencrvs-core/issues/8884
 */
export async function createEvent(
  client: ReturnType<typeof createTestClient>,
  generator: ReturnType<typeof payloadGenerator>,
  actions: Exclude<ActionType, typeof ActionType.CREATE>[]
): Promise<ReturnType<typeof client.event.create>> {
  let createdEvent: EventDocument | undefined

  // Always first create the event
  const createAction = actionToClientAction(
    client,
    generator,
    ActionType.CREATE
  )

  createdEvent = await createAction()

  for (const action of actions) {
    const clientAction = actionToClientAction(client, generator, action)
    createdEvent = await clientAction(createdEvent.id)
  }

  return createdEvent
}

/**
 * Seeds an event with the specified actions directly into the database.
 * Given set of action types, will create requested and accepted actions for each action type with CREATE and ASSIGN actions to resemble realistic event history.
 *
 * Useful for setting up test data quickly without going through the full API flow. NOTE: When testing search endpoints, remember to reindex after seeding.
 */
export async function seedEvent(
  dbClient: ReturnType<typeof getClient>,
  {
    eventConfig,
    actions,
    user,
    rng,
    administrativeHierarchy
  }: {
    eventConfig: EventConfig
    actions: (DeclarationActionType | typeof ActionType.UNASSIGN)[]
    user: Omit<UserContext, 'type'>
    rng: () => number
    administrativeHierarchy?: {
      administrativeAreas: AdministrativeArea[]
      locations: Location[]
    }
  }
) {
  const SEED_START = new Date('2020-01-01')
  const SEED_END = new Date('2023-01-01')

  const baseTime = new Date(
    generateRandomDatetime(rng, SEED_START, SEED_END)
  ).getTime()
  let offset = 0

  await dbClient.transaction().execute(async (trx) => {
    const event = await trx
      .insertInto('events')
      .values({
        eventType: eventConfig.id,
        transactionId: `tx-${Date.now()}`,
        trackingId: getUUID()
      })
      .returning(['id'])
      .executeTakeFirstOrThrow()

    const baseAction: Omit<
      NewEventActions,
      'transactionId' | 'status' | 'actionType'
    > = {
      eventId: event.id,
      createdByUserType: TokenUserType.enum.user,
      createdAtLocation: user.primaryOfficeId,
      createdBy: user.id,
      createdByRole: user.role,
      annotation: null
    }

    const createAction: NewEventActions = {
      ...baseAction,
      actionType: ActionTypes.enum.CREATE,
      transactionId: generateUuid(rng),
      status: ActionStatus.Accepted,
      createdAt: new Date(baseTime + ++offset).toISOString()
    }

    const assignAction: NewEventActions = {
      ...baseAction,
      actionType: ActionTypes.enum.ASSIGN,
      assignedTo: user.id,
      transactionId: generateUuid(rng),
      status: ActionStatus.Accepted,
      createdAt: new Date(baseTime + ++offset).toISOString()
    }

    const generatedActions: NewEventActions[] = actions.flatMap(
      (actionType): NewEventActions[] => {
        if (actionType === ActionType.UNASSIGN) {
          return [
            {
              ...baseAction,
              actionType,
              transactionId: generateUuid(rng),
              status: ActionStatus.Accepted,
              declaration: {},
              createdAt: new Date(baseTime + ++offset).toISOString()
            }
          ]
        }

        const originalActionId = getUUID()

        return [
          {
            ...baseAction,
            actionType,
            id: originalActionId,
            transactionId: generateUuid(rng),
            status: ActionStatus.Requested,
            createdAt: new Date(baseTime + ++offset).toISOString(),
            declaration: generateActionDeclarationInput(
              eventConfig,
              actionType,
              rng,
              undefined,
              administrativeHierarchy
            )
          },
          {
            ...baseAction,
            actionType,
            transactionId: generateUuid(rng),
            originalActionId,
            status: ActionStatus.Accepted,
            createdAt: new Date(baseTime + ++offset).toISOString(),
            registrationNumber:
              actionType === ActionTypes.enum.REGISTER
                ? generateRegistrationNumber(rng)
                : null,
            declaration: {}
          }
        ]
      }
    )

    await trx
      .insertInto('eventActions')
      .values([createAction, assignAction, ...generatedActions])
      .onConflict((oc) =>
        oc.columns(['transactionId', 'actionType', 'status']).doNothing()
      )
      .execute()
  })
}

/** Determine if an event index matches the provided scope filters. */
function eventMatchesScope({
  eventIndex,
  user,
  placeOfEvent,
  declaredBy,
  registeredBy,
  declaredIn,
  registeredIn,
  event,
  isUnderAdministrativeArea
}: {
  eventIndex: EventIndex
  user:
    | { id: UUID; primaryOfficeId: UUID; administrativeAreaId: UUID | null }
    | CreatedUser
  placeOfEvent?: JurisdictionFilter
  declaredBy?: UserFilter
  registeredBy?: UserFilter
  declaredIn?: JurisdictionFilter
  registeredIn?: JurisdictionFilter
  event?: string[]
  isUnderAdministrativeArea: (
    locationId: UUID,
    adminAreaId: UUID | null
  ) => boolean
}): boolean {
  if (declaredBy === UserFilter.enum.user) {
    if (eventIndex.legalStatuses.DECLARED?.createdBy !== user.id) {
      return false
    }
  }

  if (registeredBy === UserFilter.enum.user) {
    if (eventIndex.legalStatuses.REGISTERED?.createdBy !== user.id) {
      return false
    }
  }

  if (declaredIn === JurisdictionFilter.enum.location) {
    if (
      eventIndex.legalStatuses.DECLARED?.createdAtLocation !==
      user.primaryOfficeId
    ) {
      return false
    }
  }

  if (placeOfEvent === JurisdictionFilter.enum.location) {
    if (eventIndex.placeOfEvent !== user.primaryOfficeId) {
      return false
    }
  }

  if (placeOfEvent === JurisdictionFilter.enum.administrativeArea) {
    if (
      !isUnderAdministrativeArea(
        UUID.parse(eventIndex.placeOfEvent),
        user.administrativeAreaId || null
      )
    ) {
      return false
    }
  }

  if (declaredIn === JurisdictionFilter.enum.administrativeArea) {
    const declaredLocation =
      eventIndex.legalStatuses.DECLARED?.createdAtLocation

    if (!declaredLocation) {
      return false
    }

    if (
      !isUnderAdministrativeArea(
        UUID.parse(eventIndex.legalStatuses.DECLARED?.createdAtLocation),
        user.administrativeAreaId || null
      )
    ) {
      return false
    }
  }

  if (registeredIn === JurisdictionFilter.enum.location) {
    if (
      eventIndex.legalStatuses.REGISTERED?.createdAtLocation !==
      user.primaryOfficeId
    ) {
      return false
    }
  }

  if (registeredIn === JurisdictionFilter.enum.administrativeArea) {
    const registeredLocation =
      eventIndex.legalStatuses.REGISTERED?.createdAtLocation

    if (!registeredLocation) {
      return false
    }

    if (
      !isUnderAdministrativeArea(
        UUID.parse(eventIndex.legalStatuses.REGISTERED?.createdAtLocation),
        user.administrativeAreaId || null
      )
    ) {
      return false
    }
  }

  if (event) {
    if (!event.includes(eventIndex.type)) {
      return false
    }
  }

  return true
}

/**
 *
 * @param rngSeed random seed
 * @param seedActions actions to be performed on the seeded events.
 *
 * Setups test fixtures for scope testing. Seeds users and location hiearchy, with sample of events with given actions performed on them.
 * Provides utility client with all scopes to be used in tests and helper functions to attempt actions with specific scopes and assert results.
 *
 */
export async function setupScopeTestFixture(
  rngSeed: number,
  seedActions:
    | (DeclarationActionType | typeof ActionType.UNASSIGN)[]
    | fc.Arbitrary<(DeclarationActionType | typeof ActionType.UNASSIGN)[]>
) {
  const sampleSize = 200

  const { users, isUnderAdministrativeArea, administrativeAreas, locations } =
    await setupHierarchyWithUsers()

  const rng = createPrng(rngSeed)
  const eventsDb = getClient()

  const actionsArb = Array.isArray(seedActions)
    ? fc.constant(seedActions)
    : seedActions

  const eventConfigArb = fc.constantFrom(tennisClubMembershipEvent, {
    ...tennisClubMembershipEvent,
    id: 'tennis-club-membership_premium'
  })

  const sampledEvents = fc.sample(
    fc.record({
      eventConfig: eventConfigArb,
      user: fc.constantFrom(...users),
      actions: actionsArb
    }),
    sampleSize
  )

  for (const seed of sampledEvents) {
    await seedEvent(eventsDb, {
      eventConfig: seed.eventConfig,
      actions: seed.actions,
      user: seed.user,
      rng,
      administrativeHierarchy: {
        administrativeAreas,
        locations
      }
    })
  }

  const events = await eventsDb
    .selectFrom('events')
    .select(['id', 'eventType'])
    .execute()

  expect(events.length).toEqual(sampleSize)

  return {
    users,
    administrativeAreas,
    isUnderAdministrativeArea,
    eventIds: events.map(({ id }) => id)
  }
}

/**
 *
 * @param eventIds
 * @param user
 * @param scope
 * @param clientReadingAllEvents
 * @param action
 * @returns
 */
export async function attemptScopedAction(
  eventId: string,
  user: CreatedUser,
  scope: string,
  clientReadingAllEvents: any,
  action: (testClient: any) => Promise<EventDocument>
): Promise<{ success: boolean; event: EventDocument }> {
  const testClient = createTestClient(user, [scope])

  await expect(
    testClient.event.actions.assignment.assign({
      eventId,
      transactionId: getUUID(),
      assignedTo: user.id,
      type: ActionType.ASSIGN
    })
  ).resolves.not.toThrow()

  try {
    const event = await action(testClient)
    return { success: true, event }
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      const event = await clientReadingAllEvents.event.get({ eventId })
      return { success: false, event }
    }
    throw error
  }
}

export function assertScopeResult(
  result: { success: boolean; event: EventDocument },
  {
    user,
    event,
    placeOfEvent,
    isUnderAdministrativeArea,
    declaredBy,
    declaredIn,
    registeredBy,
    registeredIn
  }: {
    user: CreatedUser
    event: string[] | undefined
    placeOfEvent: JurisdictionFilter | undefined
    isUnderAdministrativeArea: (
      locationId: UUID,
      adminAreaId: UUID | null
    ) => boolean
    declaredBy?: UserFilter
    registeredBy?: UserFilter
    declaredIn?: JurisdictionFilter
    registeredIn?: JurisdictionFilter
  }
) {
  const eventConfig =
    result.event.type === TENNIS_CLUB_MEMBERSHIP
      ? tennisClubMembershipEvent
      : { ...tennisClubMembershipEvent, id: 'tennis-club-membership_premium' }

  const eventIndex = getCurrentEventState(result.event, eventConfig)

  const isAccessibleWithScope = eventMatchesScope({
    eventIndex,
    user,
    declaredBy,
    registeredBy,
    declaredIn,
    registeredIn,
    event,
    placeOfEvent,
    isUnderAdministrativeArea
  })

  expect(result.success).toBe(isAccessibleWithScope)
}
