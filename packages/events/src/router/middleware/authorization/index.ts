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
import z from 'zod'
import {
  ActionDocument,
  ActionInputWithType,
  ActionType,
  DeleteActionInput,
  findScope,
  getAssignedUserFromActions,
  getScopes,
  inScope,
  Scope,
  TokenUserType,
  WorkqueueCountInput,
  ConfigurableScopeType,
  IAuthHeader,
  UUID,
  EventDocument,
  ConfigurableScopes,
  getAuthorizedEventsFromScopes
} from '@opencrvs/commons'
import { getEventById } from '@events/service/events/events'
import { TrpcContext } from '@events/context'

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'
  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

/**
 * Extracts authorized entities from the provided configurable scopes.
 * Currently supports event types, but more options can be added in the future.
 *
 * @param scopes - Array of configurable scopes with options
 * @returns Object containing authorized entities (currently events)
 */
function getAuthorizedEntitiesFromScopes(scopes: ConfigurableScopes[]) {
  const authorizedEvents = getAuthorizedEventsFromScopes(scopes)

  return {
    ...(authorizedEvents.length > 0 && { events: authorizedEvents })
  }
}

/**
 * Checks if the auth header contains any of the configurable scopes and returns authorized entities.
 *
 * @param authHeader - Authorization header containing the token
 * @param configurableScopes - Array of configurable scope types to check against
 * @returns Object containing authorized entities (e.g. events) based on found scopes
 * @throws {TRPCError} If no matching configurable scopes are found
 */
export function inConfigurableScopes(
  authHeader: IAuthHeader,
  configurableScopes: ConfigurableScopeType[]
) {
  const userScopes = getScopes(authHeader)
  const foundScopes = configurableScopes
    .map((scope) => findScope(userScopes, scope))
    .filter((scope) => scope !== undefined)

  if (!foundScopes.length) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return getAuthorizedEntitiesFromScopes(foundScopes)
}

type CtxWithAuthorizedEntities = TrpcContext & {
  authorizedEntities?: { events?: string[] }
}

/**
 * Middleware which checks that one of the required scopes (either basic scopes or configurable scopes) are present in the token.
 *
 * @param scopes scopes that are required to access the resource
 * @param configurableScopes scopes that are configurable
 * @returns TRPC compatible middleware function
 */
export function requiresAnyOfScopes(
  scopes: Scope[],
  configurableScopes?: ConfigurableScopeType[]
) {
  const fn: MiddlewareFunction<
    TrpcContext,
    OpenApiMeta,
    TrpcContext,
    CtxWithAuthorizedEntities,
    unknown
  > = async (opts) => {
    const token = setBearerForToken(opts.ctx.token)
    const authHeader = { Authorization: token }

    // If the user has any of the allowed plain scopes, allow access
    if (inScope(authHeader, scopes)) {
      return opts.next()
    }

    // If the user has any of the allowed configurable scopes, allow the user to continue
    // and add the authorized entities to the TrpcContext which are checked in later middleware
    if (configurableScopes) {
      const authorizedEntities = inConfigurableScopes(
        authHeader,
        configurableScopes
      )

      return opts.next({
        ...opts,
        ctx: {
          ...opts.ctx,
          authorizedEntities
        }
      })
    }

    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return fn
}

/**
 * Middleware function that checks if the event type is authorized for the user.
 *
 * The function accepts either an eventId or event type directly in the input.
 * If an eventId is provided, it fetches the event to determine its type.
 *
 * Authorization is checked against authorized entities in the TrpcContext:
 * - If no authorized entities or events are present, access is allowed
 * - Otherwise, verifies the event type is included in authorized events
 *
 * @param input - Object containing either eventId or type
 * @param next - Next middleware function to be called
 * @param ctx - TrpcContext object containing authorizedEntities
 * @returns Next middleware result
 * @throws {TRPCError} With code 'FORBIDDEN' if event type is not authorized
 */
export const eventTypeAuthorization: MiddlewareFunction<
  CtxWithAuthorizedEntities,
  OpenApiMeta,
  CtxWithAuthorizedEntities,
  CtxWithAuthorizedEntities,
  { eventId: UUID } | { type: string }
> = async ({ input, next, ctx }) => {
  let eventType = 'type' in input ? input.type : undefined

  if ('eventId' in input) {
    const event = await getEventById(input.eventId)
    eventType = event.type
  }

  const { authorizedEntities } = ctx

  if (!authorizedEntities || !authorizedEntities.events) {
    return next()
  }

  if (!eventType || !authorizedEntities.events.includes(eventType)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return next()
}

export const EventIdParam = z.object({ eventId: UUID })
export type EventIdParam = z.infer<typeof EventIdParam>
export const requireAssignment: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext & { isDuplicateAction?: boolean; event: EventDocument },
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
  if (user.type === TokenUserType.Enum.system && assignedTo) {
    throw new TRPCError({
      code: 'CONFLICT',
      cause: 'System user can not perform action on assigned event'
    })
  }

  // Normal users require assignment
  if (user.type === TokenUserType.Enum.user && user.id !== assignedTo) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'You are not assigned to this event'
    })
  }

  // Check for duplicate only when we know the user is assigned to the event. Otherwise we will effectively leak the event (allow reading it) to users who are not assigned to it.
  if (
    'transactionId' in input &&
    event.actions.some(
      (action) =>
        action.transactionId === input.transactionId &&
        action.type === input.type
    )
  ) {
    return next({
      ctx: { ...ctx, isDuplicateAction: true, event },
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
  const scopes = getScopes({ Authorization: setBearerForToken(ctx.token) })

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
