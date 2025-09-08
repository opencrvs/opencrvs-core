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
  ActionStatus,
  ActionType,
  findLastAssignmentAction,
  UnassignActionInput
} from '@opencrvs/commons/events'
import { processAction, getEventById } from '@events/service/events/events'
import {
  inConfigurableScopes,
  setBearerForToken
} from '@events/router/middleware'
import { TrpcUserContext } from '@events/context'
import { getEventConfigurationById } from '@events/service/config/config'

export async function unassignRecord({
  input,
  user,
  token
}: {
  input: UnassignActionInput
  user: TrpcUserContext
  token: string
}) {
  const event = await getEventById(input.eventId)
  const configuration = await getEventConfigurationById({
    token,
    eventType: event.type
  })

  const lastAssignmentAction = findLastAssignmentAction(event.actions)

  // If last assignment action is not 'ASSIGN', simply return the event as it's already unassigned
  if (lastAssignmentAction?.type !== ActionType.ASSIGN) {
    return event
  }

  // If event is not assigned to the user who is unassigning, we need to ensure that the user may unassign others
  if (lastAssignmentAction.assignedTo !== user.id) {
    // Ensure that the user has scope to unassign users from this event type
    const { events } = inConfigurableScopes(
      { Authorization: setBearerForToken(token) },
      ['record.unassign-others']
    )

    if (!events || !events.includes(event.type)) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }
  }

  return processAction(input, {
    event,
    user,
    token,
    status: ActionStatus.Accepted,
    configuration
  })
}
