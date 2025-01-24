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
import { RejectCorrectionActionInput } from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'

class RequestNotFoundError extends TRPCError {
  constructor(id: string) {
    super({
      code: 'NOT_FOUND',
      message: `Correction request not found with ID: ${id}`
    })
  }
}

export async function rejectCorrection(
  input: RejectCorrectionActionInput,
  {
    eventId,
    createdBy,
    token,
    createdAtLocation
  }: {
    eventId: string
    createdBy: string
    createdAtLocation: string
    token: string
  }
) {
  const storedEvent = await getEventById(eventId)

  const requestAction = storedEvent.actions.find(
    (a) => a.id === input.requestId
  )

  if (!requestAction) {
    throw new RequestNotFoundError(input.requestId)
  }

  const event = await addAction(input, {
    eventId,
    createdBy,
    token,
    createdAtLocation
  })
  return event
}
