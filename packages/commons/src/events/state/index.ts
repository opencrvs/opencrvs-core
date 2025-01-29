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

import { ActionType } from '../ActionConfig'
import { ActionDocument } from '../ActionDocument'
import { EventDocument } from '../EventDocument'
import { EventIndex } from '../EventIndex'
import { EventStatus } from '../EventMetadata'

function getStatusFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<EventStatus>((status, action) => {
    if (action.type === ActionType.CREATE) {
      return EventStatus.CREATED
    }
    if (action.draft) {
      return status
    }
    if (action.type === ActionType.DECLARE) {
      return EventStatus.DECLARED
    }

    if (action.type === ActionType.VALIDATE) {
      return EventStatus.VALIDATED
    }

    if (action.type === ActionType.REGISTER) {
      return EventStatus.REGISTERED
    }
    return status
  }, EventStatus.CREATED)
}

function getAssignedUserFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<null | string>((user, action) => {
    if (action.type === ActionType.ASSIGN) {
      return action.assignedTo
    }
    if (action.type === ActionType.UNASSIGN) {
      return null
    }
    return user
  }, null)
}

function getData(
  actions: Array<ActionDocument>,
  actionTypeToNotInclude?: ActionType
) {
  return actions.reduce((status, action) => {
    if (action.type === ActionType.REQUEST_CORRECTION) {
      return status
    }

    if (action.type === ActionType.APPROVE_CORRECTION) {
      const requestAction = actions.find(({ id }) => id === action.requestId)
      if (!requestAction) {
        return status
      }
      return {
        ...status,
        ...requestAction.data
      }
    }

    return {
      ...status,
      ...(actionTypeToNotInclude
        ? action.type === actionTypeToNotInclude
          ? {}
          : action.data
        : action.data)
    }
  }, {})
}

export function isUndeclaredDraft(event: EventDocument): boolean {
  return event.actions.every(
    ({ type, draft }) => type === ActionType.CREATE || draft
  )
}

export function getCurrentEventState(
  event: EventDocument,
  actionTypeToNotInclude?: ActionType
): EventIndex {
  const creationAction = event.actions.find(
    (action) => action.type === ActionType.CREATE
  )

  if (!creationAction) {
    throw new Error(`Event ${event.id} has no creation action`)
  }

  const latestAction = event.actions[event.actions.length - 1]

  return {
    id: event.id,
    type: event.type,
    status: getStatusFromActions(event.actions),
    createdAt: event.createdAt,
    createdBy: creationAction.createdBy,
    createdAtLocation: creationAction.createdAtLocation,
    modifiedAt: latestAction.createdAt,
    assignedTo: getAssignedUserFromActions(event.actions),
    updatedBy: latestAction.createdBy,
    data: getData(event.actions, actionTypeToNotInclude)
  }
}
