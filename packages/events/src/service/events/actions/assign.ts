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
import {
  ActionStatus,
  ActionType,
  AssignActionInput
} from '@opencrvs/commons/events'
import { TRPCError } from '@trpc/server'
import { findLastAssignmentAction } from '@events/service/events/utils'

export async function assignRecord({
  createdBy,
  token,
  createdAtLocation,
  input
}: {
  createdBy: string
  createdAtLocation: string
  token: string
  input: AssignActionInput
}) {
  const storedEvent = await getEventById(input.eventId)

  const lastAssignmentAction = findLastAssignmentAction(storedEvent.actions)

  if (lastAssignmentAction?.type === ActionType.ASSIGN) {
    if (lastAssignmentAction.assignedTo === input.assignedTo) {
      return storedEvent
    }
    throw new TRPCError({
      code: 'CONFLICT'
    })
  }

  return addAction(input, {
    eventId: input.eventId,
    createdBy,
    token,
    createdAtLocation,
    transactionId: input.transactionId,
    status: ActionStatus.Accepted
  })
}
