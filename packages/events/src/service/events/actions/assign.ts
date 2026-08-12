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
import { last } from 'lodash'
import { getOrThrow, TokenWithBearer } from '@opencrvs/commons'
import {
  ActionStatus,
  ActionType,
  AssignActionInput,
  findLastAssignmentAction
} from '@opencrvs/commons/events'
import { TrpcUserContext } from '@events/context'
import { getEventConfigurationById } from '@events/service/config/config'
import { getEventById, processAction } from '@events/service/events/events'

export async function assignRecord({
  user,
  token,
  input
}: {
  user: TrpcUserContext
  token: TokenWithBearer
  input: AssignActionInput
}) {
  const storedEvent = await getEventById(input.eventId)
  const configuration = await getEventConfigurationById({
    token,
    eventType: storedEvent.type
  })
  const lastAssignmentAction = findLastAssignmentAction(storedEvent.actions)

  if (lastAssignmentAction?.type === ActionType.ASSIGN) {
    if (lastAssignmentAction.assignedTo === input.assignedTo) {
      return {
        ...storedEvent,
        actions: []
      }
    }
    throw new TRPCError({
      code: 'CONFLICT'
    })
  }

  const event = await processAction(input, {
    eventId: storedEvent.id,
    user,
    token,
    status: ActionStatus.Accepted,
    configuration
  })

  const lastAction = getOrThrow(
    last(event.actions),
    'Event did not have any actions. This should never happen.'
  )
  return {
    ...event,
    actions: [lastAction]
  }
}
