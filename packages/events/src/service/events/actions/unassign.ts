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
import { inScope, SCOPES } from '@opencrvs/commons'
import { addAction, getEventById } from '@events/service/events/events'
import { setBearerForToken } from '@events/router/middleware'

export async function unassignRecord(
  input: UnassignActionInput,
  {
    eventId,
    createdBy,
    createdByRole,
    token,
    updatedAtLocation,
    transactionId
  }: {
    eventId: string
    createdBy: string
    createdByRole: string
    updatedAtLocation: string
    token: string
    transactionId: string
  }
) {
  const storedEvent = await getEventById(eventId)
  const lastAssignmentAction = findLastAssignmentAction(storedEvent.actions)

  if (lastAssignmentAction?.type === ActionType.ASSIGN) {
    if (
      lastAssignmentAction.assignedTo !== createdBy &&
      !inScope({ Authorization: setBearerForToken(token) }, [
        SCOPES.RECORD_UNASSIGN_OTHERS
      ])
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN'
      })
    }
    return addAction(input, {
      eventId,
      createdBy,
      createdByRole,
      token,
      updatedAtLocation,
      transactionId,
      status: ActionStatus.Accepted
    })
  }

  return storedEvent
}
