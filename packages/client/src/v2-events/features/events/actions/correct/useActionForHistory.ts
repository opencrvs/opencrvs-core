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
  ActionStatus,
  EventDocument,
  getCompleteActionDeclaration,
  getCompleteActionAnnotation,
  getCompleteActionContent
} from '@opencrvs/commons/client'

/**
 * Includes a request action, if the corresponding accepted action has different transactionId
 * Merges declarations and annotations from the corresponding request action for an accepted action
 * @param fullEvent - The full EventDocument containing an actions array to filter.
 * @returns An array of actionDocument considered part of the event history.
 */
export function extractHistoryActions(
  fullEvent: EventDocument
): ActionDocument[] {
  function isHistoryAction(a: Action): a is ActionDocument {
    return !a.originalActionId
  }

  return fullEvent.actions.filter(isHistoryAction).map((action) => {
    const content = getCompleteActionContent(fullEvent, action)
    return {
      ...action,
      ...(content !== undefined ? { content } : {}),
      declaration: getCompleteActionDeclaration({}, fullEvent, action),
      annotation: getCompleteActionAnnotation(fullEvent, action)
    }
  }) as ActionDocument[]
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
  return actions.find(
    (x) =>
      x.type === ActionType.APPROVE_CORRECTION &&
      (x.requestId === requestCorrection.id ||
        x.requestId === requestCorrection.originalActionId) &&
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
