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

import { ActionType } from '../ActionType'
import { Action, ActionStatus, RegisterAction } from '../ActionDocument'
import { EventStatus } from '../EventMetadata'
import { getOrThrow } from '../../utils'

/**
 *
 * @param actionType - action type to filter for
 * @param actions - actions of the event
 * @returns existing actions for the given action type grouped by action status
 */
function getActionRequests(actionType: ActionType, actions: Action[]) {
  const filtered = actions.filter((action) => action.type === actionType)

  const accept = filtered.find(
    (action) => action.status === ActionStatus.Accepted
  )

  const request = filtered.find(
    (action) => action.status === ActionStatus.Requested
  )

  const reject = filtered.find(
    (action) => action.status === ActionStatus.Rejected
  )

  return {
    reject,
    accept,
    request
  }
}

/**
 * Given action type and actions, returns the action creation metadata for the event.
 * Since we do not consistently store the request action, we need to check if it exists.
 * * @returns details of the user who created the first **Declaration** action of that type.
 *
 */
function getDeclarationActionCreationMetadata(
  actionType: ActionType,
  actions: Action[]
) {
  const { accept: acceptAction, request: requestAction } = getActionRequests(
    actionType,
    actions
  )

  if (!acceptAction) {
    return null
  }

  const registrationNumber =
    acceptAction.type === ActionType.REGISTER
      ? (acceptAction as RegisterAction).registrationNumber
      : null

  return {
    // When 3rd party API returns 200 OK, we assume that the request was accepted, and persist single 'accepted' action.
    createdAt: requestAction?.createdAt ?? acceptAction.createdAt,
    createdBy: requestAction?.createdBy ?? acceptAction.createdBy,
    createdAtLocation:
      requestAction?.createdAtLocation ?? acceptAction.createdAtLocation,
    acceptedAt: acceptAction.createdAt,
    createdByRole: requestAction?.createdByRole ?? acceptAction.createdByRole,
    registrationNumber
  }
}

/**
 * Given action type and actions, returns the action creation metadata for the event.
 * Since we do not consistently store the request action, we need to check if it exists.
 * @returns details of last user who triggered **Declaration** action.
 * @see EventIndex for the description of the returned object.
 *
 * */
export function getDeclarationActionUpdateMetadata(actions: Action[]) {
  const createAction = getOrThrow(
    actions.find((action) => action.type === ActionType.CREATE),
    `Event has no ${ActionType.CREATE} action`
  )

  return [ActionType.DECLARE, ActionType.VALIDATE, ActionType.REGISTER].reduce(
    (metadata, actionType) => {
      const { accept, request } = getActionRequests(actionType, actions)

      return {
        createdAt:
          request?.createdAt ?? accept?.createdAt ?? metadata.createdAt,
        createdBy:
          request?.createdBy ?? accept?.createdBy ?? metadata.createdAt,
        createdAtLocation:
          request?.createdAtLocation ??
          accept?.createdAtLocation ??
          metadata.createdAt,
        createdByRole:
          request?.createdByRole ?? accept?.createdByRole ?? metadata.createdAt
      }
    },
    {
      createdAt: createAction.createdAt,
      createdBy: createAction.createdBy,
      createdAtLocation: createAction.createdAtLocation,
      createdByRole: createAction.createdByRole
    }
  )
}

/**
 * @returns the legal statuses of the event. Event is considered legal if it has been accepted.
 * @see EventIndex for the description of the returned object.
 */
export function getLegalStatuses(actions: Action[]) {
  return {
    [EventStatus.DECLARED]: getDeclarationActionCreationMetadata(
      ActionType.DECLARE,
      actions
    ),
    [EventStatus.REGISTERED]: getDeclarationActionCreationMetadata(
      ActionType.REGISTER,
      actions
    )
  }
}
