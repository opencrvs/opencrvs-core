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
import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { router, publicProcedure } from '@events/router/trpc'
import { notifyOnAction } from '@events/service/config/config'
import { addAction, updateActionStatus } from '@events/service/events/events'
import {
  SCOPES,
  RegisterActionInput,
  ActionType,
  ActionStatus,
  ActionConfirmationResponse
} from '@opencrvs/commons'

export const registerRouter = router({
  request: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    // @TODO: Find out a way to dynamically modify the MiddlewareOptions type
    .input(RegisterActionInput)
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(async ({ ctx, input }) => {
      const { token, user } = ctx
      const { eventId, transactionId } = input

      const { event, actionId } = await addAction(input, {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status: ActionStatus.Requested
      })

      const { responseStatus, body } = await notifyOnAction(input, event, token)

      // If the action is instantly accepted or rejected, simply update the action status.
      if (responseStatus === ActionConfirmationResponse.Success) {
        console.log('TÄSSÄ PITÄS TALLENTAA SE REGISTER NUMBER')
        console.log(body)
        return updateActionStatus(event.id, actionId, ActionStatus.Accepted)
      }

      if (responseStatus === ActionConfirmationResponse.Rejected) {
        return updateActionStatus(event.id, actionId, ActionStatus.Rejected)
      }

      return event
    }),

  accept: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    .input(RegisterActionInput)
    .use(middleware.validateAction(ActionType.REGISTER))
    .mutation(async ({ ctx, input }) => {
      const { token, user } = ctx
      const { eventId, transactionId } = input
      const { event } = await addAction(input, {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status: ActionStatus.Accepted
      })

      return event
    }),

  reject: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    .mutation(({ ctx, input }) => {
      // const { token, user } = ctx
      // const { eventId, transactionId } = input
      // return addAction()
    })
})
