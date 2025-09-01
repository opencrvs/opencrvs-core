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
  RejectCorrectionActionInput
} from '@opencrvs/commons/events'
import { UUID } from '@opencrvs/commons'
import { addAction, getEventById } from '@events/service/events/events'
import { TrpcUserContext } from '@events/context'
import { getEventConfigurationById } from '@events/service/config/config'
import { RequestNotFoundError } from './correction'

export async function rejectCorrection(
  input: RejectCorrectionActionInput,
  {
    eventId,
    user,
    token
  }: {
    eventId: UUID
    user: TrpcUserContext
    token: string
  }
) {
  const storedEvent = await getEventById(eventId)
  const configuration = await getEventConfigurationById({
    token,
    eventType: storedEvent.type
  })

  const requestAction = storedEvent.actions.find(
    (a) => a.id === input.requestId
  )

  if (!requestAction) {
    throw new RequestNotFoundError(input.requestId)
  }

  return addAction(input, {
    event: storedEvent,
    user,
    token,
    status: ActionStatus.Accepted,
    configuration
  })
}
