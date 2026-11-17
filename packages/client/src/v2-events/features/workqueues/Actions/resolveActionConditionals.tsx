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
  ValidatorContext
} from '@opencrvs/commons/client'
import { ActionMenuActionType, WorkqueueCtaType } from './utils'

const STATUSES_THAT_CAN_BE_ASSIGNED: EventStatus[] = [
  EventStatus.enum.NOTIFIED,
  EventStatus.enum.DECLARED,
  EventStatus.enum.REGISTERED,
  EventStatus.enum.REVOKED,
  EventStatus.enum.ARCHIVED
]

function getAvailableAssignmentActions(event: EventIndex, userId: string) {
  const assignmentStatus = getAssignmentStatus(event, userId)
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
 * Resolves "internal" conditionals for actions: rules that change with what the user does,
 * such as being online, or having the event downloaded and assigned to them.
 * See {@link resolveBaseActionConditionals} for the rules the user can't change.
 */
function resolveInternalActionConditions({
  actionType,
  isOnline,
  isDownloaded,
  assignmentStatus,
  isAssigning,
  areDuplicatesAvailable
}: {
  assignmentStatus: AssignmentStatus
  actionType: Exclude<
    WorkqueueCtaType | ActionMenuActionType,
    typeof ClientSpecificAction.CONTINUE_DRAFT
  >
  isOnline: boolean
  isDownloaded: boolean
  isAssigning: boolean
  areDuplicatesAvailable: boolean
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
    case ActionType.UNARCHIVE:
    case ActionType.REVOKE_REGISTRATION:
    case ActionType.REINSTATE_REGISTRATION:
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
        enabled:
          isDownloadedAndAssignedToUser &&
          !isAssigning &&
          areDuplicatesAvailable,
        visible: true
      }
    case ActionType.DECLARE:
      return { enabled: isDownloadedAndAssignedToUser, visible: true }
    case ActionType.READ:
      return { enabled: true, visible: true }
    default:
      throw new Error(
        `Unknown action type ${actionType} when resolving internal action conditionals`
      )
  }
}

/**
 * Resolves "base" conditionals for actions: rules the user can't change by their own actions.
 * Checks that the action is available in the event's state, the user's scopes allow it,
 * and the action's configured conditionals pass.
 *
 * CONTINUE_DRAFT uses only these, since a draft opens offline and without assignment.
 */
export function resolveBaseActionConditionals({
  event,
  actionType,
  validatorContext,
  isActionAllowedForUser,
  eventConfiguration
}: {
  event: EventIndex
  actionType: DisplayableAction
  validatorContext: ValidatorContext
  isActionAllowedForUser: (action: DisplayableAction) => boolean
  eventConfiguration: EventConfig
}) {
  const user = getOrThrow(
    validatorContext.user,
    'Cannot determine action conditionals without user information'
  )

  // 1. Gather all available actions for the event, including assignment actions
  const allAvailableActions = [
    ...getAvailableActionsForEvent(event),
    ...getAvailableAssignmentActions(event, user.sub)
  ]

  // 2. Check if the action is available for the event at all.
  const actionIsAvailableForEvent = allAvailableActions.includes(actionType)
  // 3. Check if the user can perform it.
  const actionIsAllowedForUser = isActionAllowedForUser(actionType)
  const actionConfig = getActionConfig({ eventConfiguration, actionType })

  // 4. Check if the action is enabled/visible based on the configuration conditionals.
  const isVisible = actionConfig
    ? isActionVisible(actionConfig, event, validatorContext)
    : true
  const isEnabled = actionConfig
    ? isActionEnabled(actionConfig, event, validatorContext)
    : true

  return {
    enabled: actionIsAvailableForEvent && actionIsAllowedForUser && isEnabled,
    visible: actionIsAvailableForEvent && actionIsAllowedForUser && isVisible
  }
}

/**
 * Given event and action type, determines if the action should be enabled and visible for the user.
 */
export function resolveActionConditionals({
  event,
  actionType,
  validatorContext,
  isActionAllowedForUser,
  eventConfiguration,
  isOnline,
  isDownloaded,
  isAssigning,
  areDuplicatesAvailable = true
}: {
  event: EventIndex
  actionType: Exclude<
    WorkqueueCtaType | ActionMenuActionType,
    typeof ClientSpecificAction.CONTINUE_DRAFT
  >
  validatorContext: ValidatorContext
  isActionAllowedForUser: (action: DisplayableAction) => boolean
  eventConfiguration: EventConfig
  isOnline: boolean
  isDownloaded: boolean
  isAssigning: boolean
  areDuplicatesAvailable?: boolean
}): {
  enabled: boolean
  visible: boolean
} {
  const user = getOrThrow(
    validatorContext.user,
    'Cannot determine action conditionals without user information'
  )

  // 1-5. The base result.
  const base = resolveBaseActionConditionals({
    event,
    actionType,
    validatorContext,
    isActionAllowedForUser,
    eventConfiguration
  })

  // 6. Run hardcoded internal business rules.
  const internalConditions = resolveInternalActionConditions({
    actionType,
    isOnline,
    assignmentStatus: getAssignmentStatus(event, user.sub),
    isDownloaded,
    isAssigning,
    areDuplicatesAvailable
  })

  return {
    enabled: base.enabled && internalConditions.enabled,
    visible: base.visible && internalConditions.visible
  }
}
