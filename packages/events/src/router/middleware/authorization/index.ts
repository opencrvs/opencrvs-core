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
import { TRPCError } from '@trpc/server'
import { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import * as z from 'zod/v4'
import { findLast } from 'lodash'
import {
  Action,
  ActionDocument,
  ActionInputWithType,
  ActionStatus,
  ActionType,
  DeleteActionInput,
  getAssignedUserFromActions,
  getScopes,
  TokenUserType,
  WorkqueueCountInput,
  UUID,
  EventDocument,
  getTokenPayload,
  getCurrentEventState,
  EventInput,
  RecordScopeTypeV2,
  RecordScopeV2,
  canUserCreateEvent,
  getEventConfigById,
  userCanAccessEventWithScopes,
  getAcceptedScopesFromToken,
  ScopeType,
  hasAnyScope,
  hasScope,
  getScopeOptionValue,
  getAcceptedScopesByType,
  canAccessOtherUserWithScopes,
  UserScopeType,
  CreateUserInput,
  canAccessUserWithScope,
  ActionConfirmationScopeType,
  hasScopeForActionConfirmation
} from '@opencrvs/commons'
import { EventNotFoundError, getEventById } from '@events/service/events/events'
import { ServiceTrpcContext, TrpcContext } from '@events/context'
import { getUserById } from '@events/storage/postgres/events/users'
import { getSystemInitialisation } from '@events/service/auth'
import { getLocationHierarchy } from '@events/service/locations/locations'
import { findUserOrSystem, getUser } from '../../../service/users/api'
import { getInMemoryEventConfigurations } from '../../../service/config/config'
import { getEventIndexWithAdministrativeHierarchy } from '../../../service/indexing/utils'

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'
  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

/**
 * Middleware to check if the user has any of the specified allowed scopes.
 *
 * Checks the given list of scope types against the scopes in the user's JWT token.
 * If at least one of the provided scopes is found, access is granted and
 * the middleware passes control to the next step. Otherwise, a TRPCError
 * with code 'FORBIDDEN' is thrown.
 *
 * @param {ScopeType[]} scopes - Array of allowed scope types.
 * @returns {MiddlewareFunction} TRPC-compatible middleware function.
 */
export function allowedWithAnyOfScopes(scopes: ScopeType[]) {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    TrpcContext,
    unknown
  > = async (opts) => {
    const { token } = opts.ctx

    // If the user has any of the allowed plain scopes, allow access
    if (hasAnyScope(token, scopes)) {
      return opts.next()
    }

    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return fn
}

export const canUpdateUser: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  { id: UUID; primaryOfficeId?: UUID; role?: string }
> = async (opts) => {
  const { input, ctx } = opts
  const { token } = ctx

  const existingUser = await getUserById(input.id)
  if (!existingUser) {
    throw new TRPCError({
      code: 'FORBIDDEN'
    })
  }

  const scopes = getAcceptedScopesFromToken(token, ['user.edit'])

  const currentLocationHierarchy = await getLocationHierarchy(
    existingUser.officeId
  )

  const updatedLocationHierarchy = input.primaryOfficeId
    ? await getLocationHierarchy(input.primaryOfficeId)
    : currentLocationHierarchy

  const updatedRole = input.role ?? existingUser.role
  const updatedOfficeId = input.primaryOfficeId ?? existingUser.officeId

  const canAccessExistingAndUpdatedUser = scopes.some(
    (scope) =>
      canAccessUserWithScope({
        userToAccess: {
          role: existingUser.role,
          primaryOfficeId: existingUser.officeId,
          administrativeHierarchy: currentLocationHierarchy
        },
        scope,
        user: ctx.user
      }) &&
      canAccessUserWithScope({
        userToAccess: {
          role: updatedRole,
          primaryOfficeId: updatedOfficeId,
          administrativeHierarchy: updatedLocationHierarchy
        },
        scope,
        user: ctx.user
      })
  )

  if (!canAccessExistingAndUpdatedUser) {
    throw new TRPCError({
      code: 'FORBIDDEN'
    })
  }

  return opts.next()
}

export const EventIdParam = z.object({
  eventId: UUID,
  customActionType: z.string().optional()
})
export const EventIdParamWithWaitFor = EventIdParam.extend({
  waitFor: z
    .boolean()
    .default(true)
    .describe(
      'Whether the action should wait for the event to be indexed before returning. Defaults to true. Setting this to false completes faster but might lead to stale data in the client if the client tries to read the event immediately after performing the action. Use with care.'
    )
})

export type EventIdParam = z.infer<typeof EventIdParam>
export type EventIdParamWithWaitFor = z.infer<typeof EventIdParamWithWaitFor>

export const requireAssignment: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & { existingAction?: ActionDocument; event: EventDocument },
  ActionInputWithType | DeleteActionInput | EventIdParam
> = async ({ input, next, ctx }) => {
  const event = await getEventById(input.eventId)
  const { user } = ctx

  const assignedTo = getAssignedUserFromActions(
    event.actions.filter(
      (action): action is ActionDocument =>
        action.type === ActionType.ASSIGN || action.type === ActionType.UNASSIGN
    )
  )

  // Normal users require assignment
  if (user.type === TokenUserType.enum.user && user.id !== assignedTo) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'You are not assigned to this event'
    })
  }

  // Check for duplicate only when we know the user is assigned to the event. Otherwise we will effectively leak the event (allow reading it) to users who are not assigned to it.
  if ('transactionId' in input) {
    const existingAction = findLast(
      event.actions,
      (action) =>
        action.transactionId === input.transactionId &&
        action.type === input.type
    )
    return next({
      ctx: { ...ctx, existingAction, event },
      input
    })
  }
  return next()
}

export const requireScopeForWorkqueues: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  WorkqueueCountInput
> = async ({ next, ctx, input }) => {
  const scopes = getScopes(ctx.token)

  const workqueueScopes = getAcceptedScopesByType({
    acceptedScopes: ['workqueue'],
    scopes
  })

  if (!workqueueScopes.length) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  const availableWorkqueues = workqueueScopes.flatMap((s) =>
    getScopeOptionValue(s, 'ids')
  )

  if (input.some(({ slug }) => !availableWorkqueues.includes(slug))) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next()
}

/**
 * Given scope types, determines whether the user has relevant scopes to access the event based on the current state.
 *
 */
export const canAccessEventWithScopes = (scopes: RecordScopeTypeV2[]) => {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    TrpcContext & { eventId: UUID; eventType: string },
    unknown
  > = async ({ next, ctx, getRawInput }) => {
    const { eventId: grantedEventId } = getTokenPayload(ctx.token)
    const eventConfigs = await getInMemoryEventConfigurations(ctx.token)
    const acceptedScopes = getAcceptedScopesFromToken(ctx.token, scopes)

    if (acceptedScopes.length === 0) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    // Since determining access requires knowing the event type, we need to parse the input before we can check access.
    // default .input(...) throws 400, which is something that we want to return only if the user should have access.
    const rawInput = await getRawInput()
    const input = EventIdParam.safeParse(rawInput).data

    if (!input) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }

    if (grantedEventId && grantedEventId !== input.eventId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Token does not grant access to this event'
      })
    }

    const event = await getEventById(input.eventId)
    const eventConfig = getEventConfigById(eventConfigs, event.type)

    const eventIndex = getCurrentEventState(event, eventConfig)
    const eventIndexWithLocationHierarchy =
      await getEventIndexWithAdministrativeHierarchy(eventConfig, eventIndex)

    const hasAccess = userCanAccessEventWithScopes(
      eventIndexWithLocationHierarchy,
      acceptedScopes,
      ctx.user,
      input.customActionType
    )

    if (!hasAccess) {
      throw new EventNotFoundError(input.eventId)
    }

    return next({
      ctx: {
        ...ctx,
        acceptedScopes,
        eventId: input.eventId,
        eventType: event.type
      }
    })
  }

  return fn
}

const ActionConfirmationParams = z.object({
  eventId: UUID,
  actionId: UUID
})

/**
 * Authorises confirming (accepting or rejecting) one requested action.
 *
 * Confirming must never be reachable with the same credentials that requested
 * the action: otherwise whoever requests a registration can immediately confirm
 * it themselves, choosing the registration number and overriding the reviewed
 * declaration, without the country configuration ever being involved. Two
 * callers are legitimate here, and each gets its own path:
 *
 * 1. The country configuration, holding the action-bound token core minted for
 *    it in `defaultRequestHandler`. Its `record.action.accept` /
 *    `record.action.reject` scope names this exact action, so the binding is the
 *    whole authorisation — no further event scope is required.
 *
 * 2. A long-running integration confirming later under its own system client
 *    (e.g. mosip-api, which confirms once MOSIP issues a credential, long after
 *    any bound token would have expired). A system client is provisioned by an
 *    administrator and cannot request the action in the first place, so holding
 *    the action's own scope is enough for it.
 *
 * A logged-in user's own token satisfies neither, which is the point.
 */
/**
 * Resolves the action an accept/reject call names, and refuses anything other
 * than the pending action of the matching type.
 *
 * `actionId` is otherwise only looked up by id, so an action of any type or
 * status would do — including one already accepted, or a CREATE. That would let
 * a caller manufacture an accepted action of the type they picked, bypassing
 * `throwConflictIfActionNotAllowed`, `validateAction`, `requireAssignment` and
 * duplicate detection, all of which run on `request` and none of which run on a
 * confirmation.
 *
 * Passes the event and the two actions on in context so the handler does not
 * fetch and scan them a second time.
 */
export function requireConfirmableAction(actionType: ActionType) {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    TrpcContext & {
      event: EventDocument
      originalAction: Action
      confirmationAction?: Action
    },
    unknown
  > = async ({ ctx, next, getRawInput }) => {
    const input = ActionConfirmationParams.safeParse(await getRawInput()).data

    if (!input) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }

    const event = await getEventById(input.eventId)
    const originalAction = event.actions.find(({ id }) => id === input.actionId)

    if (!originalAction) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Action not found.' })
    }

    if (originalAction.status !== ActionStatus.Requested) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Action ${originalAction.id} is not awaiting confirmation.`
      })
    }

    if (originalAction.type !== actionType) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Action ${originalAction.id} is of type ${originalAction.type}, cannot be confirmed as ${actionType}.`
      })
    }

    return next({
      ctx: {
        ...ctx,
        event,
        originalAction,
        confirmationAction: event.actions.find(
          ({ originalActionId }) => originalActionId === input.actionId
        )
      }
    })
  }

  return fn
}

export function requireActionConfirmation({
  scopeType,
  systemClientScopes
}: {
  scopeType: ActionConfirmationScopeType
  systemClientScopes: RecordScopeTypeV2[]
}) {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    TrpcContext,
    unknown
  > = async (opts) => {
    const { ctx, next, getRawInput } = opts
    const input = ActionConfirmationParams.safeParse(await getRawInput()).data

    if (!input) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }

    if (
      hasScopeForActionConfirmation(
        getScopes(ctx.token),
        scopeType,
        input.actionId
      )
    ) {
      return next()
    }

    if (ctx.user.type === TokenUserType.enum.system) {
      return canAccessEventWithScopes(systemClientScopes)(opts)
    }

    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'Confirming an action requires a token bound to that action, or a system client holding the action scope.'
    })
  }

  return fn
}

/**
 * Middleware to check that the user has search scopes and adds them to context.
 * Search differs from other endpoints, since it targets multiple events. Accepted scopes are later used to filter the search result query.
 */
export const canSearchEvents: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & { acceptedScopes: RecordScopeV2[] },
  unknown
> = async (opts) => {
  const acceptedScopes = getAcceptedScopesFromToken(opts.ctx.token, [
    'record.search'
  ])

  if (acceptedScopes.length === 0) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return opts.next({
    ...opts,
    ctx: {
      ...opts.ctx,
      acceptedScopes
    }
  })
}

export const canSearchUsers: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  unknown
> = async (opts) => {
  const acceptedScopes = getAcceptedScopesFromToken(opts.ctx.token, [
    'user.search'
  ])

  if (acceptedScopes.length === 0) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return opts.next(opts)
}

export const userCanCreateEvent: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  unknown
> = async ({ next, ctx, getRawInput }) => {
  const eventConfigs = await getInMemoryEventConfigurations(ctx.token)

  if (!hasScope(ctx.token, 'record.create')) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  // Since determining access requires knowing the event type, we need to parse the input before we can check access.
  // default .input(...) throws 400, which is something that we want to return only if the user should have access.
  const rawInput = await getRawInput()
  const input = EventInput.safeParse(rawInput).data

  if (!input) {
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }

  const eventConfig = eventConfigs.find((c) => c.id === input.type)

  if (!eventConfig) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `No configuration found for event type: ${input.type}`
    })
  }

  const canCreateEvent = canUserCreateEvent(getScopes(ctx.token), input.type)

  if (!canCreateEvent) {
    throw new TRPCError({
      code: 'FORBIDDEN'
    })
  }

  return next()
}

export function canAccessUserWithScopes(scopes: UserScopeType[]) {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    TrpcContext & { id: UUID },
    { id: UUID } | UUID
  > = async ({ next, ctx, input }) => {
    const parseResult = UUID.safeParse(input)
    const incomingId: UUID = parseResult.success
      ? parseResult.data
      : (input as { id: UUID }).id

    const acceptedScopes = getAcceptedScopesFromToken(ctx.token, scopes)

    const userRequesting = ctx.user
    if (acceptedScopes.length === 0) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    const otherUser = await findUserOrSystem(incomingId)

    // Don't reveal the existence of the user
    if (!otherUser) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    // Not supported for system users
    if (otherUser.type === TokenUserType.enum.system) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    if (!userRequesting.primaryOfficeId) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    const userLocationHierarchy = await getLocationHierarchy(
      otherUser.primaryOfficeId
    )

    const hasAccess = canAccessOtherUserWithScopes({
      scopes: acceptedScopes,
      userToAccess: {
        role: otherUser.role,
        administrativeHierarchy: userLocationHierarchy,
        primaryOfficeId: otherUser.primaryOfficeId
      },
      user: userRequesting
    })

    if (!hasAccess) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    return next({
      ctx: {
        ...ctx,
        userId: incomingId
      },
      input
    })
  }

  return fn
}

export function canCreateUserWithScopes(scopes: UserScopeType[]) {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    TrpcContext,
    CreateUserInput
  > = async ({ next, ctx, input }) => {
    const acceptedScopes = getAcceptedScopesFromToken(ctx.token, scopes)

    const userRequesting = ctx.user
    const userToCreate = input

    if (acceptedScopes.length === 0) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    if (!userRequesting.primaryOfficeId) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    const userLocationHierarchy = await getLocationHierarchy(
      userToCreate.primaryOfficeId
    )

    const hasAccess = canAccessOtherUserWithScopes({
      scopes: acceptedScopes,
      userToAccess: {
        role: userToCreate.role,
        administrativeHierarchy: userLocationHierarchy,
        primaryOfficeId: userToCreate.primaryOfficeId
      },
      user: userRequesting
    })

    if (!hasAccess) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    return next()
  }

  return fn
}

export const userCanReadOtherUser: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & UUID,
  UUID
> = async ({ next, ctx, input }) => {
  const { token, user: userReading } = ctx

  const acceptedScopes = getAcceptedScopesFromToken(token, ['user.read'])

  const isRequestingOwnUser = userReading.id === input

  if (acceptedScopes.length === 0 && !isRequestingOwnUser) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  const otherUser = await getUser(input)

  if (isRequestingOwnUser) {
    return next()
  }

  if (acceptedScopes.length === 0) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  if (!otherUser.primaryOfficeId) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  const userLocationHierarchy = await getLocationHierarchy(
    otherUser.primaryOfficeId
  )

  const hasAccess = canAccessOtherUserWithScopes({
    scopes: acceptedScopes,
    userToAccess: {
      role: otherUser.role,
      administrativeHierarchy: userLocationHierarchy,
      primaryOfficeId: otherUser.primaryOfficeId
    },
    user: userReading
  })

  if (!hasAccess) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  return next()
}

export const userCanReadUserAudit: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & { userId: UUID },
  { userId: UUID }
> = async ({ next, ctx, input }) => {
  const { token, user: userReading } = ctx

  // Throw early to avoid mistakes in the logic below.
  // There are test cases for each but better safe than sorry.
  const acceptedScopes = getAcceptedScopesFromToken(token, ['user.read'])
  const hasReadMyAuditScope = hasScope(token, 'user.read-only-my-audit')

  if (acceptedScopes.length === 0 && !hasReadMyAuditScope) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }
  const otherUser = await getUser(input.userId)

  if (hasReadMyAuditScope && userReading.id === otherUser.id) {
    return next()
  }

  if (!otherUser.primaryOfficeId) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  const userLocationHierarchy = await getLocationHierarchy(
    otherUser.primaryOfficeId
  )

  const hasAccess = canAccessOtherUserWithScopes({
    scopes: acceptedScopes,
    userToAccess: {
      role: otherUser.role,
      administrativeHierarchy: userLocationHierarchy,
      primaryOfficeId: otherUser.primaryOfficeId
    },
    user: userReading
  })

  if (!hasAccess) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  return next({
    ctx: {
      ...ctx,
      userId: input.userId
    },
    input
  })
}

export function canInitialiseSystem() {
  const fn: MiddlewareFunction<
    ServiceTrpcContext,
    unknown,
    ServiceTrpcContext,
    ServiceTrpcContext,
    unknown
  > = async (opts) => {
    const systemInitialisation = await getSystemInitialisation()

    if (systemInitialisation.completedAt !== null) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    return opts.next()
  }

  return fn
}
