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

import { experimental_standaloneMiddleware, TRPCError } from '@trpc/server'
import { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
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
  WorkqueueCountInput,
  ConfigurableScopeType,
  ConfigurableScopes,
  IAuthHeader
} from '@opencrvs/commons'
import { Context } from '@events/router/middleware/utils'
import { getEventById } from '@events/service/events/events'

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'

  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

/**
 * Extracts authorized events from the found configurable scopes.
 * Currently supports event types, but more options can be added in the future.
 *
 * @param scopes - Array of configurable scopes with options
 * @returns Object containing authorized events
 */
function getAuthorizedEntitiesFromScopes(scopes: ConfigurableScopes[]) {
  const authorizedEvents = scopes
    .flatMap(({ options }) => {
      if ('event' in options) {
        return options.event
      }

      return undefined
    })
    .filter((event) => event !== undefined)

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
function inConfigurableScopes(
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

type CtxWithAuthorizedEntities = Context & {
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
    Context,
    OpenApiMeta,
    Context,
    CtxWithAuthorizedEntities,
    unknown
  > = async (opts) => {
    const token = setBearerForToken(opts.ctx.token)
    const authHeader = { Authorization: token }

    // If the user has any of the allowd plain scopes, allow access
    if (inScope(authHeader, scopes)) {
      return opts.next()
    }

    // If the user has any of the allowed configurable scopes, allow the user to continue
    // and add the authorized entities to the context which are checked in later middleware
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
 * Authorization is checked against authorized entities in the context:
 * - If no authorized entities or events are present, access is allowed
 * - Otherwise, verifies the event type is included in authorized events
 *
 * @param input - Object containing either eventId or type
 * @param next - Next middleware function to be called
 * @param ctx - Context object containing authorizedEntities
 * @returns Next middleware result
 * @throws {TRPCError} With code 'FORBIDDEN' if event type is not authorized
 */
export const eventTypeAuthorization: MiddlewareFunction<
  CtxWithAuthorizedEntities,
  OpenApiMeta,
  CtxWithAuthorizedEntities,
  CtxWithAuthorizedEntities,
  { eventId: string } | { type: string }
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

/**@todo Investigate: `experimental_standaloneMiddleware has been deprecated in favor of .concat()` */
export const requireAssignment = experimental_standaloneMiddleware<{
  input: ActionInputWithType | DeleteActionInput
  ctx: Context
}>().create(async ({ next, ctx, input }) => {
  const event = await getEventById(input.eventId)
  if (
    'transactionId' in input &&
    event.actions.some((action) => action.transactionId === input.transactionId)
  ) {
    return next({
      ctx: { ...ctx, isDuplicateAction: true, event },
      input
    })
  }

  const assignedTo = getAssignedUserFromActions(
    event.actions.filter(
      (action): action is ActionDocument =>
        action.type === ActionType.ASSIGN || action.type === ActionType.UNASSIGN
    )
  )

  if (ctx.user.id !== assignedTo) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: JSON.stringify('You are not assigned to this event')
    })
  }
  return next()
})

export const requireScopeForWorkqueues = experimental_standaloneMiddleware<{
  input: WorkqueueCountInput
  ctx: Context
}>().create(async ({ next, ctx, input }) => {
  const scopes = getScopes({ Authorization: setBearerForToken(ctx.token) })

  const availableWorkqueues = findScope(scopes, 'workqueue')?.options.id ?? []

  if (input.some(({ slug }) => !availableWorkqueues.includes(slug))) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})
