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
import { addAction } from '@events/service/events/events'
import {
  ActionProcedure,
  defaultRequestHandler,
  getDefaultActionProcedures
} from '@events/router/event/actions'
import { getInMemoryEventConfigurations } from '@events/service/config/config'
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

        if (isDuplicateAction) {
          return ctx.event
        }

        const configs = await getInMemoryEventConfigurations(token)

        const declaredEvent = await defaultRequestHandler(input, user, token)

        const config = configs.find((c) => c.id === declaredEvent.type)

        if (!config) {
          throw new Error(
            `Event configuration not found with type: ${declaredEvent.type}`
          )
        }

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
              content: {
                duplicates: duplicates.map(({ event: { id, trackingId } }) => ({
                  id,
                  trackingId
                }))
              }
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
