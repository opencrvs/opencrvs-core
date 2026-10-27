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
 * Resolves "internal" conditionals for actions. e.g. ensures user is online when needed, or the event is downloaded and assigned to the user for certain actions.
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

interface ActionConditionalsContext {
  event: EventIndex
  validatorContext: ValidatorContext
  isActionAllowedForUser: (action: DisplayableAction) => boolean
  eventConfiguration: EventConfig
}

/**
 * Checks that the action is available for the event, the user can perform it,
 * and the action's configured conditionals allow it.
 */
function resolveBaseActionConditionals({
  event,
  actionType,
  userId,
  validatorContext,
  isActionAllowedForUser,
  eventConfiguration
}: ActionConditionalsContext & {
  actionType: DisplayableAction
  userId: string
}) {
  // 1. Gather all available actions for the event, including assignment actions
  const allAvailableActions = [
    ...getAvailableActionsForEvent(event),
    ...getAvailableAssignmentActions(event, userId)
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
  actionType,
  isOnline,
  isDownloaded,
  isAssigning,
  areDuplicatesAvailable = true,
  ...context
}: ActionConditionalsContext & {
  actionType: Exclude<
    WorkqueueCtaType | ActionMenuActionType,
    typeof ClientSpecificAction.CONTINUE_DRAFT
  >
  isOnline: boolean
  isDownloaded: boolean
  isAssigning: boolean
  areDuplicatesAvailable?: boolean
}): {
  enabled: boolean
  visible: boolean
} {
  const user = getOrThrow(
    context.validatorContext.user,
    'Cannot determine action conditionals without user information'
  )

  // 1-5. The base result.
  const base = resolveBaseActionConditionals({
    ...context,
    actionType,
    userId: user.sub
  })

  // 6. Run hardcoded internal business rules.
  const internalConditions = resolveInternalActionConditions({
    actionType,
    isOnline,
    assignmentStatus: getAssignmentStatus(context.event, user.sub),
    isDownloaded,
    isAssigning,
    areDuplicatesAvailable
  })

  return {
    enabled: base.enabled && internalConditions.enabled,
    visible: base.visible && internalConditions.visible
  }
}

/**
 * Determines if the user can continue their draft of the event. The draft's own action
 * must still be available to them. A draft opens without assignment or a connection, so
 * the internal rules of its action don't apply.
 */
export function resolveContinueDraftConditionals({
  draftActionType,
  ...context
}: ActionConditionalsContext & {
  /** Undefined when the user has no draft of the event */
  draftActionType: DisplayableAction | undefined
}): {
  enabled: boolean
  visible: boolean
} {
  if (!draftActionType) {
    return { enabled: false, visible: false }
  }

  const user = getOrThrow(
    context.validatorContext.user,
    'Cannot determine action conditionals without user information'
  )

  return resolveBaseActionConditionals({
    ...context,
    actionType: draftActionType,
    userId: user.sub
  })
}
