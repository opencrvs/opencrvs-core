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
import { Action, ActionStatus, ActionType } from '@opencrvs/commons/events'

/**
 * Guards the accept/reject routes against confirming anything other than the
 * pending action they name.
 *
 * `actionId` is only looked up by id, so without this an action of any type or
 * status would do — including one that is already accepted, or a CREATE. That
 * would let a caller manufacture an accepted action of the type they picked,
 * bypassing `throwConflictIfActionNotAllowed`, `validateAction`,
 * `requireAssignment` and duplicate detection, all of which run on `request`
 * and none of which run here.
 */
export function assertConfirmableAction(action: Action, actionType: ActionType) {
  if (action.status !== ActionStatus.Requested) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Action ${action.id} is not awaiting confirmation.`
    })
  }

  if (action.type !== actionType) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Action ${action.id} is of type ${action.type}, cannot be confirmed as ${actionType}.`
    })
  }
}
