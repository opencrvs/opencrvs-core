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
import { getUUID } from '@opencrvs/commons'
import {
  ActionType,
  ActionStatus,
  EventDocument,
  DeclareActionInput,
  ACTION_ALLOWED_SCOPES,
  ACTION_ALLOWED_CONFIGURABLE_SCOPES,
  getCurrentEventState
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { systemProcedure } from '@events/router/trpc'
import {
  getEventById,
  addAction,
  throwConflictIfActionNotAllowed
} from '@events/service/events/events'
import {
  ActionProcedure,
  getDefaultActionProcedures
} from '@events/router/event/actions'
import {
  ActionConfirmationResponse,
  requestActionConfirmation
} from '@events/router/event/actions/actionConfirmationRequest'
import { getEventConfigurations } from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'

export function declareActionProcedures(): ActionProcedure {
  const requireScopesMiddleware = requiresAnyOfScopes(
    ACTION_ALLOWED_SCOPES[ActionType.DECLARE],
    ACTION_ALLOWED_CONFIGURABLE_SCOPES[ActionType.DECLARE]
  )

  return {
    ...getDefaultActionProcedures(ActionType.DECLARE),
    request: systemProcedure
      .use(requireScopesMiddleware)
      .input(DeclareActionInput)
      .use(middleware.eventTypeAuthorization)
      .use(middleware.requireAssignment)
      .use(middleware.validateAction)
      .output(EventDocument)
      .mutation(async ({ ctx, input }) => {
        const { token, user, isDuplicateAction } = ctx
        const { eventId } = input
        const actionId = getUUID()

        if (isDuplicateAction) {
          return ctx.event
        }

        await throwConflictIfActionNotAllowed(
          eventId,
          ActionType.DECLARE,
          ctx.token
        )

        const configs = await getEventConfigurations(token)
        const event = await getEventById(eventId)
        const config = configs.find((c) => c.id === event.type)

        if (!config) {
          throw new Error(
            `Event configuration not found with type: ${event.type}`
          )
        }

        const { responseStatus } = await requestActionConfirmation(
          input,
          event,
          token,
          actionId
        )

        // If we get an unexpected failure response, we just return HTTP 500 without saving the
        if (responseStatus === ActionConfirmationResponse.UnexpectedFailure) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected failure from notification API'
          })
        }

        let status: ActionStatus = ActionStatus.Requested

        // If we immediately get a rejected response, we can mark the action as rejected
        if (responseStatus === ActionConfirmationResponse.Rejected) {
          status = ActionStatus.Rejected
        }

        // If we immediately get a success response, we mark the action as succeeded
        // and also validate the payload received from the notify API
        if (responseStatus === ActionConfirmationResponse.Success) {
          status = ActionStatus.Accepted
        }

        const declaredEvent = await addAction(input, {
          user,
          token,
          status
        })

        const dedupConfig = config.actions.find(
          (action) => action.type === input.type
        )?.deduplication

        if (!dedupConfig) {
          return declaredEvent
        }
        const declaredEventState = getCurrentEventState(declaredEvent, config)
        const duplicates = await searchForDuplicates(
          declaredEventState,
          dedupConfig,
          config
        )

        if (duplicates.length > 0) {
          return addAction(
            {
              type: ActionType.DUPLICATE_DETECTED,
              transactionId: input.transactionId,
              eventId: input.eventId,
              declaration: input.declaration,
              content: { duplicates: duplicates.map((d) => d.event.id) }
            },
            {
              user,
              token,
              status: ActionStatus.Accepted
            }
          )
        }
        return declaredEvent
      })
  }
}
