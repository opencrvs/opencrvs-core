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
  ActionType,
  ActionTypes,
  AssignmentStatus,
  ClientSpecificAction,
  DisplayableAction,
  EventConfig,
  EventIndex,
  EventStatus,
  filterActionsByFlags,
  getActionConfig,
  getAssignmentStatus,
  getAvailableActionsForEvent,
  getOrThrow,
  isActionEnabled,
  isActionVisible,
  ITokenPayload,
  ValidatorContext,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { ActionMenuActionType } from './utils'

const STATUSES_THAT_CAN_BE_ASSIGNED: EventStatus[] = [
  EventStatus.enum.NOTIFIED,
  EventStatus.enum.DECLARED,
  EventStatus.enum.REGISTERED,
  EventStatus.enum.ARCHIVED
]

function getAvailableAssignmentActions(
  event: EventIndex,
  authentication: ITokenPayload
) {
  filterActionsByFlags
  const assignmentStatus = getAssignmentStatus(event, authentication.sub)
  const eventStatus = event.status

  let actions: ActionTypes[] = []
  if (!STATUSES_THAT_CAN_BE_ASSIGNED.includes(eventStatus)) {
    return []
  }

  if (assignmentStatus === AssignmentStatus.UNASSIGNED) {
    actions = [ActionType.ASSIGN]
  } else {
    actions = [ActionType.UNASSIGN]
  }

  return filterActionsByFlags(actions, event.flags)
}

/**
 * Resolves "internal" conditionals for actions. e.g. ensures user is online when needed, or the event is downloaded and assigned to the user for certain actions.
 */
function resolveInternalActionConditions({
  actionType,
  isOnline,
  isDownloaded,
  assignmentStatus,
  isAssigning,
  isDeclareDraftOpen
}: {
  assignmentStatus: AssignmentStatus
  actionType: WorkqueueActionType | ActionMenuActionType
  isOnline: boolean
  isDownloaded: boolean
  isAssigning: boolean
  isDeclareDraftOpen: boolean
}): {
  enabled: boolean
  visible: boolean
} {
  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  switch (actionType) {
    case ActionType.ASSIGN:
    case ActionType.UNASSIGN:
      return {
        enabled: isOnline,
        visible: true
      }
    case ActionType.ARCHIVE:
    case ActionType.DELETE:
    case ActionType.EDIT:
    case ActionType.REJECT:
    case ActionType.REGISTER:
    case ActionType.PRINT_CERTIFICATE:
    case ActionType.REQUEST_CORRECTION:
    case ClientSpecificAction.REVIEW_CORRECTION_REQUEST:
      return { enabled: isDownloadedAndAssignedToUser, visible: true }
    case ActionType.MARK_AS_DUPLICATE:
      return {
        enabled: isDownloadedAndAssignedToUser && !isAssigning,
        visible: true
      }
    case ActionType.DECLARE:
      return {
        enabled: isDownloadedAndAssignedToUser || isDeclareDraftOpen,
        visible: true
      }
    case ActionType.READ:
      return { enabled: true, visible: true }
    default:
      throw new Error(
        `Unknown action type ${actionType} when resolving internal action conditionals`
      )
  }
}

/**
 * Given event and action type, determines if the action should be enabled and visible for the user.
 */
export function resolveActionConditionals({
  event,
  actionType,
  isDeclareDraftOpen,
  validatorContext,
  isActionAllowedForUser,
  eventConfiguration,
  isOnline,
  isDownloaded,
  isAssigning
}: {
  event: EventIndex
  actionType: WorkqueueActionType | ActionMenuActionType
  isDeclareDraftOpen: boolean
  validatorContext: ValidatorContext
  isActionAllowedForUser: (action: DisplayableAction) => boolean
  eventConfiguration: EventConfig
  isOnline: boolean
  isDownloaded: boolean
  isAssigning: boolean
}): {
  enabled: boolean
  visible: boolean
} {
  const user = getOrThrow(
    validatorContext.user,
    'Cannot determine action conditionals without user information'
  )

  const availableEventActions = getAvailableActionsForEvent(event)
  const availableAssignActions = getAvailableAssignmentActions(event, user)
  // 1. Gather all available actions for the event, including assignment actions
  const allAvailableActions = [
    ...availableEventActions,
    ...availableAssignActions
  ]

  const assignmentStatus = getAssignmentStatus(event, user.sub)

  // 2. Check if the action is available for the event at all.
  const actionIsAvailableForEvent = allAvailableActions.includes(actionType)
  // 3. Check if the user can perform it.
  // For DECLARE, also allow users with NOTIFY scope — they can enter the declare form
  // and submit as NOTIFY. Mirrors the same logic in DeclarationAction.tsx.
  const actionIsAllowedForUser =
    actionType === ActionType.DECLARE
      ? isActionAllowedForUser(ActionType.DECLARE) ||
        isActionAllowedForUser(ActionType.NOTIFY)
      : isActionAllowedForUser(actionType)
  const actionConfig = getActionConfig({ eventConfiguration, actionType })

  // 4. Check if the action is enabled/visible based on the configuration conditionals.
  const isVisible = actionConfig
    ? isActionVisible(actionConfig, event, validatorContext)
    : true
  const isEnabled = actionConfig
    ? isActionEnabled(actionConfig, event, validatorContext)
    : true

  // 5. Combine all the above to determine if the action should be enabled and visible as the base result.
  const baseEnabled =
    actionIsAvailableForEvent && actionIsAllowedForUser && isEnabled
  const baseVisible =
    actionIsAvailableForEvent && actionIsAllowedForUser && isVisible

  // 6. Run hardcoded internal business rules.
  const internalConditions = resolveInternalActionConditions({
    actionType,
    isOnline,
    assignmentStatus,
    isDownloaded,
    isAssigning,
    isDeclareDraftOpen
  })

  return {
    enabled: baseEnabled && internalConditions.enabled,
    visible: baseVisible && internalConditions.visible
  }
}
