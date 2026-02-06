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
import { useMemo } from 'react'
import {
  ActionType,
  ClientSpecificAction,
  CtaActionType,
  EventIndex,
  getActionConfig,
  getAvailableActionsForEvent,
  getOrThrow,
  InherentFlags,
  isActionEnabled,
  isActionVisible
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useOnlineStatus } from '@client/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { useUserAllowedActions } from './useUserAllowedActions'
import { actionLabels, ActionMenuItem } from './utils'
import { useActionOnClick } from './useActionOnClick'
import { getAvailableAssignmentActions } from './useAllowedActionConfigurations'

export function useResolveInternalActionConditions(
  event: EventIndex,
  actionType: CtaActionType | ClientSpecificAction,
  userId: string
) {
  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent

  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)

  const assignmentStatus = getAssignmentStatus(event, userId)
  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const isAssignmentInProgress = events.actions.assignment.assign.isAssigning(
    event.id
  )

  // @todo
  const hasDeclarationDraftOpen = true

  const eventIsWaitingForCorrection = event.flags.includes(
    InherentFlags.CORRECTION_REQUESTED
  )

  switch (actionType) {
    case ActionType.ASSIGN:
      return {
        enabled: isOnline && eventIsWaitingForCorrection,
        visible: true
      }
    case ActionType.UNASSIGN:
      return {
        enabled: isOnline,
        visible: true
      }
    case ActionType.ARCHIVE:
      return {
        enabled: isDownloadedAndAssignedToUser,
        visible: true
      }
    case ActionType.MARK_AS_DUPLICATE:
      return {
        enabled: isDownloadedAndAssignedToUser && !isAssignmentInProgress,
        visible: true
      }
    case ActionType.DELETE:
      return {
        enabled: isDownloadedAndAssignedToUser,
        visible: true
      }
    case ActionType.DECLARE:
      return {
        enabled: isDownloadedAndAssignedToUser && !hasDeclarationDraftOpen,
        visible: true
      }
    case ActionType.EDIT:
      return {
        enabled: isDownloadedAndAssignedToUser
      }
    case ActionType.REJECT:
      return {
        enabled: isDownloadedAndAssignedToUser,
        visible: true
      }

    case ActionType.REGISTER:
      return {
        enabled: isDownloadedAndAssignedToUser,
        visible: true
      }
    case ActionType.PRINT_CERTIFICATE:
      return {
        enabled: isDownloadedAndAssignedToUser && !eventIsWaitingForCorrection,
        visible: !eventIsWaitingForCorrection
      }

    case ActionType.REQUEST_CORRECTION:
      return {
        enabled: isDownloadedAndAssignedToUser && !eventIsWaitingForCorrection,
        visible: !eventIsWaitingForCorrection
      }

    // @todo: what about this? can we get rid of this
    case ClientSpecificAction.REVIEW_CORRECTION_REQUEST:
      return {
        enabled: isDownloadedAndAssignedToUser,
        visible: eventIsWaitingForCorrection
      }

    case ActionType.READ:
      return {
        enabled: true,
        visible: true
      }
  }
}

/**
 * Given event and action type, determines if the action should be enabled and visible for the user.
 */
export function useResolveActionConditionals(
  event: EventIndex,
  actionType: CtaActionType
) {
  const validatorContext = useValidatorContext()
  const { isActionAllowed: isActionAllowedForUser } = useUserAllowedActions(
    event.type
  )

  // @todo: come up with a name or single method for these. Confusing that they are separate but both required to determine if an action is enabled/visible.
  const availableEventActions = getAvailableActionsForEvent(event)
  const availableAssignActions = getAvailableAssignmentActions(
    event,
    getOrThrow(
      validatorContext.user,
      'User information is required in validator context to determine assignment actions'
    )
  )
  // 1. Gather all available actions for the event, including assignment actions
  const allAvailableActions = useMemo(
    () => [...availableEventActions, ...availableAssignActions],
    [availableEventActions, availableAssignActions]
  )
  const { eventConfiguration } = useEventConfiguration(event.type)

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
  const internalConditions = useResolveInternalActionConditions(
    event,
    actionType,
    validatorContext.user?.sub || ''
  )

  return {
    enabled: baseEnabled && internalConditions.enabled,
    visible: baseVisible && internalConditions.visible
  }
}

// Given an event and action type, returns the configuration for the action item.
export function useGetActionConfiguration(
  event: EventIndex,
  actionType: CtaActionType
): ActionMenuItem {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const actionConfig = getActionConfig({ eventConfiguration, actionType })

  const { enabled, visible } = useResolveActionConditionals(event, actionType)

  const { onClick } = useActionOnClick(event)

  return {
    label: actionLabels[actionType],
    type: actionType,
    icon: actionConfig?.icon || 'Offline',
    onClick: (workqueue?: string) => onClick(actionType, workqueue),
    disabled: !enabled,
    hidden: !visible
  }
}
