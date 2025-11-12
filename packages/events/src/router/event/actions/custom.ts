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
import {
  ActionType,
  ActionStatus,
  EventDocument,
  CustomActionInput
} from '@opencrvs/commons/events'
import { findScope, getScopes } from '@opencrvs/commons'
import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { systemProcedure } from '@events/router/trpc'
import { getEventById, processAction } from '@events/service/events/events'
import { getDefaultActionProcedures } from '@events/router/event/actions'
import { getInMemoryEventConfigurations } from '@events/service/config/config'

function allowCustomAction(token: string, customActionType: string): boolean {
  const foundScope = findScope(getScopes(token), 'record.custom-action')
  if (!foundScope) {
    return false
  }

  if (!foundScope.options.customActionType.includes(customActionType)) {
    return false
  }

  return true
}

export function customActionProcedures() {
  return {
    ...getDefaultActionProcedures(ActionType.CUSTOM),
    request: systemProcedure
      .use(requiresAnyOfScopes([], ['record.custom-action']))
      .input(CustomActionInput)
      .use(async ({ ctx, input, next }) => {
        if (allowCustomAction(ctx.token, input.customActionType)) {
          return next()
        }

        throw new TRPCError({ code: 'FORBIDDEN' })
      })
      .use(middleware.requireAssignment)
      .use(middleware.validateAction)
      .output(EventDocument)
      .mutation(async ({ ctx, input }) => {
        const { token, user, existingAction } = ctx

        // If an action exists but is not in the REQUESTED state,
        // then we consider the action to have been fully handled already.
        // For future reference, it would also make sense to have the pending state
        // of the country config HTTP request be persisted in the database
        // so that even if you ran the request twice consecutively, it would not
        // trigger two country config requests in parallel.
        if (
          existingAction &&
          existingAction.status !== ActionStatus.Requested
        ) {
          return ctx.event
        }

        const configs = await getInMemoryEventConfigurations(token)
        const event = await getEventById(input.eventId)
        const config = configs.find((c) => c.id === event.type)

        if (!config) {
          throw new Error(
            `Event configuration not found with type: ${event.type}`
          )
        }

        const actionConfig = config.actions.find(
          (a) =>
            a.type === ActionType.CUSTOM &&
            a.customActionType === input.customActionType
        )

        if (!actionConfig) {
          throw new Error(
            `Custom action configuration not found with name: ${input.customActionType}`
          )
        }

        const updatedEvent = await processAction(
          {
            type: ActionType.CUSTOM,
            customActionType: input.customActionType,
            eventId: input.eventId,
            transactionId: input.transactionId,
            declaration: {}
          },
          {
            event,
            user,
            token,
            status: ActionStatus.Accepted,
            configuration: config
          }
        )

        // const declaredEvent = await defaultRequestHandler(
        //   input,
        //   user,
        //   token,
        //   event,
        //   config,
        //   CustomActionInput
        // )

        return updatedEvent
      })
  }
}
