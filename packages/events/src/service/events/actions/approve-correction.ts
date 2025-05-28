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
  ActionStatus,
  ApproveCorrectionActionInput
} from '@opencrvs/commons/events'
import { addAction, getEventById } from '@events/service/events/events'
import { UserDetails } from '@events/router/middleware'
import { RequestNotFoundError } from './correction'

export async function approveCorrection(
  input: ApproveCorrectionActionInput,
  {
    eventId,
    userDetails,
    token,
    transactionId
  }: {
    eventId: string
    userDetails: UserDetails
    token: string
    transactionId: string
  }
) {
  const storedEvent = await getEventById(eventId)

  const requestAction = storedEvent.actions.find(
    (a) => a.id === input.requestId
  )

  if (!requestAction) {
    throw new RequestNotFoundError(input.requestId)
  }

  return addAction(input, {
    eventId,
    userDetails,
    token,
    transactionId,
    status: ActionStatus.Accepted
  })
}
