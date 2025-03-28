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
import { addAction, getEventById } from '@events/service/events/events'
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

      const event = await getEventById(eventId)

      const { responseStatus, body } = await notifyOnAction(
        input,
        await getEventById(eventId),
        token
      )

      let status = ActionStatus.Requested
      let actionInput = input

      // If we get an unexpected failure response, we don't want to save the action
      if (responseStatus === ActionConfirmationResponse.UnexpectedFailure) {
        // TODO CIHAN: error http response?
        return event
      }

      // If we immediatly get a rejected response, we can mark the action as rejected
      if (responseStatus === ActionConfirmationResponse.Rejected) {
        status = ActionStatus.Rejected
      }

      // If we immediatly get a success response, we can save the registration number and mark the action as accepted
      if (responseStatus === ActionConfirmationResponse.Success) {
        const registrationNumber = body?.registrationNumber

        if (!registrationNumber || typeof registrationNumber !== 'string') {
          throw new Error('Invalid registration number!')
        }

        actionInput = { ...actionInput, registrationNumber }
        status = ActionStatus.Accepted
      }

      const { event: updatedEvent } = await addAction(actionInput, {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status
      })

      return updatedEvent
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
