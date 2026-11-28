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
import { useSelector } from 'react-redux'
import React, { useMemo } from 'react'
import {
  ActionType,
  EventIndex,
  CustomActionConfig,
  isActionEnabled,
  isActionVisible,
  getAvailableActionsForEvent,
  isValidIcon,
  getAcceptedScopesByType,
  getAssignmentStatus,
  AssignmentStatus
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

import { useEventConfigurationForRecord } from '@client/v2-events/features/events/useEventConfiguration'
import { getScope } from '@client/profile/profileSelectors'
import { useCustomActionModal } from '@client/v2-events/features/events/actions/quick-actions/useQuickActionModal'
import { useActionConditionalContext } from '@client/v2-events/hooks/useConditionalContext'
import { useCanAccessEventWithScopes } from '@client/v2-events/hooks/useCanAccessEventWithScopes'
import { ActionMenuItem } from './utils'

export function useCustomActionConfigs(event: EventIndex): {
  customActionModal: React.ReactNode
  customActionConfigs: ActionMenuItem[]
} {
  const scopes = useSelector(getScope)
  const { useFindEventFromCache } = useEvents().getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)
  const { canAccessEventWithScopes } = useCanAccessEventWithScopes(event.id, [
    'record.custom-action'
  ])

  const { eventConfiguration } = useEventConfigurationForRecord(event)
  const actionContext = useActionConditionalContext(
    cachedEvent.data
      ? { eventDocument: cachedEvent.data, eventConfig: eventConfiguration }
      : { eventIndex: event }
  )
  const userId = actionContext.user.sub
  const { customActionModal, onCustomAction } = useCustomActionModal(
    event.id,
    eventConfiguration
  )
  const assignmentStatus = getAssignmentStatus(event, userId)

  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const hasCustomActionScope =
    getAcceptedScopesByType({
      acceptedScopes: ['record.custom-action'],
      scopes: scopes ?? []
    }).length > 0

  const customActionConfigs = useMemo(() => {
    const form = { declaration: event.declaration }

    if (!hasCustomActionScope) {
      return []
    }

    // The event's status and flags decide whether custom actions are available
    // at all. The backend enforces the same list, so skipping this check would
    // offer actions that fail with a 409.
    if (!getAvailableActionsForEvent(event).includes(ActionType.CUSTOM)) {
      return []
    }

    return eventConfiguration.actions
      .filter(
        (action): action is CustomActionConfig =>
          action.type === ActionType.CUSTOM
      )
      .filter(({ customActionType }) =>
        canAccessEventWithScopes(customActionType)
      )
      .map((action) => ({
        label: action.label,
        icon: isValidIcon(action.icon) ? action.icon : ('PencilLine' as const),
        onClick: async (backTo?: string) => onCustomAction(action, backTo),
        disabled: !(
          isDownloadedAndAssignedToUser &&
          isActionEnabled(action, form, actionContext)
        ),
        hidden: !isActionVisible(action, form, actionContext),
        type: ActionType.CUSTOM,
        customActionType: action.customActionType
      }))
  }, [
    hasCustomActionScope,
    eventConfiguration.actions,
    isDownloadedAndAssignedToUser,
    actionContext,
    event,
    onCustomAction,
    canAccessEventWithScopes
  ])

  return {
    customActionModal: hasCustomActionScope ? customActionModal : null,
    customActionConfigs
  }
}
