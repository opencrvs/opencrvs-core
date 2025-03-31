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
import { addAction, getEventById } from '@events/service/events/events'
import { ActionType, ActionStatus } from '@opencrvs/commons'
import { getActionProceduresBase } from '.'
import { TRPCError } from '@trpc/server'
const registerActionProcedureBase = getActionProceduresBase(ActionType.REGISTER)

export const registerRouterHandlers = {
  request: registerActionProcedureBase.request.mutation(({ ctx, input }) => {
    const { token, user, status, actionId } = ctx
    const { eventId, transactionId } = input

    console.log('CIHAN TESTAA')
    console.log(input)

    // @ts-ignore
    const registrationNumber = input?.registrationNumber
    if (!registrationNumber || typeof registrationNumber !== 'string') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid registration number received from notification API'
      })
    }

    return addAction(
      input,
      {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status
      },
      actionId
    )
  }),
  accept: registerActionProcedureBase.accept.mutation(({ ctx, input }) => {
    const { token, user, alreadyAccepted } = ctx
    const { eventId, transactionId, actionId } = input

    if (alreadyAccepted) {
      return getEventById(input.eventId)
    }

    return addAction(input, {
      eventId,
      createdBy: user.id,
      createdAtLocation: user.primaryOfficeId,
      token,
      transactionId,
      status: ActionStatus.Accepted,
      confirmationForActionWithId: actionId
    })
  }),
  reject: registerActionProcedureBase.reject
}
