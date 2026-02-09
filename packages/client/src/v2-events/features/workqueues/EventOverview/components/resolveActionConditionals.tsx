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
  ClientSpecificAction,
  CtaActionType,
  EventConfig,
  EventIndex,
  getActionConfig,
  getAvailableActionsForEvent,
  getOrThrow,
  InherentFlags,
  isActionEnabled,
  isActionVisible,
  ValidatorContext
} from '@opencrvs/commons/client'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { getAvailableAssignmentActions } from './useAllowedActionConfigurations'

/**
 * Resolves "internal" conditionals for actions. e.g. ensures user is online when needed, or the event is downloaded and assigned to the user for certain actions.
 */
function resolveInternalActionConditions({
  event,
  actionType,
  isOnline,
  isDownloaded,
  userId,
  isAssigning,
  isDeclareDraftOpen
}: {
  event: EventIndex
  actionType: CtaActionType | ClientSpecificAction
  isOnline: boolean
  isDownloaded: boolean
  userId: string
  isAssigning: boolean
  isDeclareDraftOpen: boolean
}) {
  const assignmentStatus = getAssignmentStatus(event, userId)
  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded
  const eventIsWaitingForCorrection = event.flags.includes(
    InherentFlags.CORRECTION_REQUESTED
  )

  switch (actionType) {
    case ActionType.ASSIGN:
      return {
        enabled: isOnline && !eventIsWaitingForCorrection,
        visible: true
      }
    case ActionType.UNASSIGN:
      return { enabled: isOnline, visible: true }
    case ActionType.ARCHIVE:
    case ActionType.DELETE:
    case ActionType.EDIT:
    case ActionType.REJECT:
    case ActionType.REGISTER:
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
    case ActionType.PRINT_CERTIFICATE:
    case ActionType.REQUEST_CORRECTION:
      return {
        enabled: isDownloadedAndAssignedToUser && !eventIsWaitingForCorrection,
        visible: !eventIsWaitingForCorrection
      }
    case ClientSpecificAction.REVIEW_CORRECTION_REQUEST:
      return {
        enabled: isDownloadedAndAssignedToUser,
        visible: eventIsWaitingForCorrection
      }
    case ActionType.READ:
      return { enabled: true, visible: true }
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
  actionType: CtaActionType
  isDeclareDraftOpen: boolean
  validatorContext: ValidatorContext
  isActionAllowedForUser: (action: CtaActionType) => boolean
  eventConfiguration: EventConfig
  isOnline: boolean
  isDownloaded: boolean
  isAssigning: boolean
}) {
  const user = getOrThrow(
    validatorContext.user,
    'Cannot determine action conditionals without user information'
  )
  // @todo: come up with a name or single method for these. Confusing that they are separate but both required to determine if an action is enabled/visible.
  const availableEventActions = getAvailableActionsForEvent(event)
  const availableAssignActions = getAvailableAssignmentActions(event, user)
  // 1. Gather all available actions for the event, including assignment actions
  const allAvailableActions = [
    ...availableEventActions,
    ...availableAssignActions
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

  // 5. Combine all the above to determine if the action should be enabled and visible as the base result.
  const baseEnabled =
    actionIsAvailableForEvent && actionIsAllowedForUser && isEnabled
  const baseVisible =
    actionIsAvailableForEvent && actionIsAllowedForUser && isVisible

  // 6. Run hardcoded internal business rules. @TODO: These should be conditionals.
  const internalConditions = resolveInternalActionConditions({
    event,
    actionType,
    isOnline,
    isDownloaded,
    userId: user.sub,
    isAssigning,
    isDeclareDraftOpen
  })

  return {
    enabled: baseEnabled && internalConditions.enabled,
    visible: baseVisible && internalConditions.visible
  }
}
