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
  InherentFlags,
  TokenWithBearer,
  UUID,
  getCurrentEventState
} from '@opencrvs/commons'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventById } from '../events'

export class RequestNotFoundError extends TRPCError {
  constructor(id: string) {
    super({
      code: 'NOT_FOUND',
      message: `Correction request not found with ID: ${id}`
    })
  }
}

/**
 * Throws an error if the event is waiting for correction.
 * This is used to prevent users from performing certain actions if the event is waiting for correction.
 *
 * Why is this not a middleware, you ask?
 * Because we want it to work together with the idempotency, which is only checked in the mutation with the 'isDuplicateAction' flag.
 *
 * @param eventId - The ID of the event to check
 * @param token - The authentication token
 * @throws {TRPCError} When the event is already waiting for correction
 */
export async function throwConflictIfWaitingForCorrection(
  eventId: UUID,
  token: TokenWithBearer
) {
  const event = await getEventById(eventId)

  const eventConfig = await getEventConfigurationById({
    eventType: event.type,
    token
  })

  const eventState = getCurrentEventState(event, eventConfig)

  if (eventState.flags.includes(InherentFlags.CORRECTION_REQUESTED)) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Event is waiting for correction'
    })
  }
}
