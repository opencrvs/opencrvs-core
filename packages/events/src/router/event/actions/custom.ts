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
  allowCustomAction,
  CustomActionInput
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import { systemProcedure } from '@events/router/trpc'
import { getEventById } from '@events/service/events/events'
import {
  defaultRequestHandler,
  getDefaultActionProcedures
} from '@events/router/event/actions'
import { getInMemoryEventConfigurations } from '@events/service/config/config'

export function customActionProcedures() {
  return {
    ...getDefaultActionProcedures(ActionType.CUSTOM),
    request: systemProcedure
      .input(CustomActionInput)
      .use(async ({ ctx, input, next }) => {
        try {
          const event = await getEventById(input.eventId)
          if (
            !allowCustomAction(ctx.token, event.type, input.customActionType)
          ) {
            throw new TRPCError({ code: 'FORBIDDEN' })
          }

          return await next()
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
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
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Event configuration not found with type: ${event.type}`
          })
        }

        const actionConfig = config.actions.find(
          (a) =>
            a.type === ActionType.CUSTOM &&
            a.customActionType === input.customActionType
        )

        if (!actionConfig) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Custom action configuration not found with name: ${input.customActionType}`
          })
        }

        return defaultRequestHandler(
          input,
          user,
          token,
          event,
          config,
          CustomActionInput
        )
      })
  }
}
