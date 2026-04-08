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

import { TRPCError } from '@trpc/server'
import { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import * as z from 'zod/v4'
import { findLast } from 'lodash'
import {
  ActionDocument,
  ActionInputWithType,
  ActionType,
  DeleteActionInput,
  findScope,
  getAssignedUserFromActions,
  getScopes,
  TokenUserType,
  WorkqueueCountInput,
  UUID,
  EventDocument,
  getTokenPayload,
  hasScopeOld,
  SCOPES,
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
  hasScope
} from '@opencrvs/commons'
import { EventNotFoundError, getEventById } from '@events/service/events/events'
import { TrpcContext } from '@events/context'
import { AsyncActionConfirmationResponseSchema } from '@events/router/event/actions'
import { findUserOrSystem } from '../../../service/users/api'
import { getInMemoryEventConfigurations } from '../../../service/config/config'
import { getEventIndexWithAdministrativeHierarchy } from '../../../service/indexing/utils'
import { isLocationUnderAdministrativeArea } from '../../../storage/postgres/administrative-hierarchy/locations'

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'
  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

function inScope(token: string, scopes: string[]) {
  const tokenScopes = getScopes(token)
  return scopes.some((scope) => tokenScopes.includes(scope))
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

export const EventIdParam = z.object({
  eventId: UUID,
  customActionType: z.string().optional()
})
export type EventIdParam = z.infer<typeof EventIdParam>

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

  // System users can not perform action on assigned events
  if (user.type === TokenUserType.enum.system && assignedTo) {
    throw new TRPCError({
      code: 'CONFLICT',
      cause: 'System user can not perform action on assigned event'
    })
  }

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
  const workqueueScope = findScope(scopes, 'workqueue')

  if (!workqueueScope) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  const availableWorkqueues = workqueueScope.options.id

  if (input.some(({ slug }) => !availableWorkqueues.includes(slug))) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
}

/**
 * Checks that the token has been exchanged for the specific `eventId` and `actionId` in the input.
 *
 * Registrars token can be exchanged in auth into a more specific token with `eventId` and `actionId`.
 * This is useful when tokens need to be exposed outside of core of OpenCRVS, e.g. countryconfig or external systems.
 */
export const requireActionConfirmationAuthorization: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  AsyncActionConfirmationResponseSchema
> = async ({ next, ctx, input }) => {
  const { token } = ctx
  const { eventId, actionId } = getTokenPayload(token)

  const hasConfirmAndRejectScope =
    hasScope(token, 'record.confirm-registration') &&
    hasScope(token, 'record.reject-registration')

  if (!hasConfirmAndRejectScope) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Missing required scopes for action confirmation'
    })
  }

  const isActionConfirmationToken = eventId && actionId

  if (!isActionConfirmationToken) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Missing required claims for action confirmation'
    })
  }

  if (eventId !== input.eventId || actionId !== input.actionId) {
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

    const event = await getEventById(input.eventId)
    const eventConfig = getEventConfigById(eventConfigs, event.type)

    const eventIndex = getCurrentEventState(event, eventConfig)
    const eventIndexWithLocationHierarchy =
      await getEventIndexWithAdministrativeHierarchy(eventConfig, eventIndex)

    const hasAccess = userCanAccessEventWithScopes(
      eventIndexWithLocationHierarchy,
      acceptedScopes,
      ctx.user,
      input?.customActionType
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

export const userCanCreateEvent: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  unknown
> = async ({ next, ctx, getRawInput }) => {
  const eventConfigs = await getInMemoryEventConfigurations(ctx.token)

  const acceptedScopes = getAcceptedScopesFromToken(ctx.token, [
    'record.create'
  ])

  if (acceptedScopes.length === 0) {
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

  const canCreateEvent = canUserCreateEvent(acceptedScopes, input.type)

  if (!canCreateEvent) {
    throw new TRPCError({
      code: 'FORBIDDEN'
    })
  }

  return next()
}

export const userCanReadOtherUser: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & { userId: string },
  { userId: string }
> = async ({ next, ctx, input }) => {
  const { token, user: userReading } = ctx

  // Throw early to avoid mistakes in the logic below.
  // There are test cases for each but better safe than sorry.
  const scopeFound = hasScope(token, 'user.read')

  if (!scopeFound) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  const otherUser = await findUserOrSystem(input.userId, token)

  // Don't reveal the existence of the user
  if (!otherUser) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  // Not supported for system users
  if (otherUser.type === TokenUserType.enum.system) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  if (!userReading.primaryOfficeId) {
    throw new TRPCError({ code: 'NOT_FOUND' })
  }

  // TODO CIHAN: check audit?
  if (hasScope(token, 'user.read')) {
    return next()
  }

  if (
    inScope(token, [
      SCOPES.USER_READ_MY_OFFICE,
      SCOPES.USER_READ_MY_JURISDICTION
    ]) &&
    userReading.primaryOfficeId === otherUser.primaryOfficeId
  ) {
    return next()
  }

  // If administrative area is undefined, we consider the user has access to all locations.
  // This will change once we implement 2.0. user scopes.
  const isUnderJurisdiction = userReading.administrativeAreaId
    ? await isLocationUnderAdministrativeArea({
        administrativeAreaId: userReading.administrativeAreaId,
        locationId: otherUser.primaryOfficeId
      })
    : true

  if (
    hasScopeOld(token, SCOPES.USER_READ_MY_JURISDICTION) &&
    isUnderJurisdiction
  ) {
    return next()
  }

  if (
    hasScopeOld(token, SCOPES.USER_READ_ONLY_MY_AUDIT) &&
    userReading.id === otherUser.id
  ) {
    return next()
  }

  throw new TRPCError({ code: 'NOT_FOUND' })
}
