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

import { ActionDocument, CreatedAction } from '../ActionDocument'
import { EventDocument } from '../EventDocument'
import { EventIndex } from '../EventIndex'
import { EventStatus } from '../EventMetadata'

function getStatusFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<EventStatus>((status, action) => {
    if (action.type === 'CREATE') {
      return 'CREATED'
    }
    if (action.type === 'DECLARE') {
      return 'DECLARED'
    }
    if (action.type === 'DRAFT') {
      return 'DRAFT'
    }
    if (action.type === 'REGISTER') {
      return 'REGISTERED'
    }
    return status
  }, 'CREATED')
}

function getAssignedUserFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<null | string>((status, action) => {
    if (action.type === 'ASSIGN') {
      return action.assignedTo
    }
    if (action.type === 'UNASSIGN') {
      return null
    }
    return status
  }, null)
}

function getData(actions: Array<ActionDocument>) {
  return actions.reduce((status, action) => {
    return {
      ...status,
      ...action.data
    }
  }, {})
}

export function getCurrentEventState(event: EventDocument): EventIndex {
  const creationAction = event.actions.find(
    (action) => action.type === 'CREATE'
  ) as CreatedAction
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
    data: getData(event.actions)
  }
}
