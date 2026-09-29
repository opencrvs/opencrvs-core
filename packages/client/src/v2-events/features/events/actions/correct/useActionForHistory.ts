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
  Action,
  ActionDocument,
  ActionType,
  EventDocument
} from '@opencrvs/commons/client'

export function extractHistoryActions(
  fullEvent: EventDocument
): ActionDocument[] {
  function isHistoryAction(action: Action): action is ActionDocument {
    return !action.originalActionId
  }

  return fullEvent.actions.filter(isHistoryAction)
}

/**
 * Finds the APPROVE_CORRECTION that immediately (directly) approved the given
 * REQUEST_CORRECTION — i.e. a direct correction where the same user requested
 * and approved in a single step. Such pairs are collapsed in the audit history
 * to a single 'Record corrected' row.
 *
 * Shared by the history label resolution (`getActionTypeForHistory`) and the
 * history row visibility/flagging in `EventHistory`, so both agree on what
 * counts as an immediate correction.
 */
export function findImmediateApproveCorrection(
  actions: ActionDocument[],
  requestCorrection: ActionDocument
): ActionDocument | undefined {
  const requestIds = new Set([requestCorrection.id])

  if (requestCorrection.originalActionId) {
    requestIds.add(requestCorrection.originalActionId)
  }

  for (const a of actions) {
    if (a.originalActionId === requestCorrection.id) {
      requestIds.add(a.id)
    }
  }

  return actions.find(
    (x) =>
      x.type === ActionType.APPROVE_CORRECTION &&
      requestIds.has(x.requestId) &&
      x.content?.immediateCorrection &&
      x.createdBy === requestCorrection.createdBy
  )
}

export function useActionForHistory() {
  function getActionTypeForHistory(
    actions: ActionDocument[],
    action: ActionDocument
  ) {
    if (
      action.type === ActionType.REQUEST_CORRECTION &&
      findImmediateApproveCorrection(actions, action)
    ) {
      return 'CORRECTED'
    }

    return action.type
  }

  return { getActionTypeForHistory }
}
