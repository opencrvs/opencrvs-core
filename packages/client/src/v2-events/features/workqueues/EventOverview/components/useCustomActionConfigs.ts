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
  configurableEventScopeAllowed,
  ITokenPayload,
  CustomActionConfig
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { getScope } from '@client/profile/profileSelectors'
import { useCustomActionModal } from '@client/v2-events/features/events/actions/quick-actions/useQuickActionModal'
import { ActionMenuItem } from './utils'

export function useCustomActionConfigs(
  event: EventIndex,
  authentication: ITokenPayload
): {
  customActionModal: React.ReactNode
  customActionConfigs: ActionMenuItem[]
} {
  const scopes = useSelector(getScope)
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { customActionModal, onCustomAction } = useCustomActionModal(
    event.id,
    eventConfiguration
  )
  const { useFindEventFromCache } = useEvents().getEvent
  const isDownloaded = Boolean(useFindEventFromCache(event.id).data)
  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const customActionConfigs = useMemo(() => {
    return eventConfiguration.actions
      .filter(
        (action): action is CustomActionConfig =>
          action.type === ActionType.CUSTOM
      )
      .filter((action) =>
        configurableEventScopeAllowed(
          scopes ?? [],
          ['record.custom-action'],
          event.type,
          action.customActionType
        )
      )
      .map((action) => ({
        label: action.label,
        icon: action.icon ?? ('PencilLine' as const),
        onClick: async (workqueue?: string) =>
          onCustomAction(action, workqueue),
        disabled: !isDownloadedAndAssignedToUser,
        hidden: false,
        type: ActionType.CUSTOM,
        customActionType: action.customActionType
      }))
  }, [
    eventConfiguration.actions,
    scopes,
    event.type,
    isDownloadedAndAssignedToUser,
    onCustomAction
  ])

  const hasCustomActionScope = configurableEventScopeAllowed(
    scopes ?? [],
    ['record.custom-action'],
    event.type
  )

  if (!hasCustomActionScope) {
    return {
      customActionModal: null,
      customActionConfigs: []
    }
  }

  return { customActionModal, customActionConfigs }
}
