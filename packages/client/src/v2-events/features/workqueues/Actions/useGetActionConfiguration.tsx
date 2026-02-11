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
  EventIndex,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import {
  useAssignmentActionConfigurationResolver,
  useEventActionConfigurationResolver
} from './useActionConfigurationResolver'
import { ActionMenuActionType, ActionMenuItem } from './utils'
import { useCustomActionConfigs } from './useCustomActionConfigs'

/**
 * Given an event and action type, returns the configuration for the action item.
 * Used to determine CTA button state for search result rows.
 *
 * Note: This handles only a subset of action types.
 * 1. Assignment actions or custom actions are not available for workqueue item CTAs
 * 2. Rendering items with modals is costly and intentionally omitted. Which luckily align with point 1.
 *
 *
 */
export function useGetWorkqueueActionConfiguration(
  event: EventIndex,
  actionType: WorkqueueActionType
) {
  const { resolveAction } = useEventActionConfigurationResolver(event)

  return resolveAction(actionType)
}

/**
 *
 * @returns array of action menu item configurations.
 */
export function useGetActionMenuActionConfigurations(event: EventIndex): {
  modals: [React.ReactNode[], React.ReactNode]
  actions: ActionMenuItem[]
} {
  const { resolveAction, modals: eventModals } =
    useEventActionConfigurationResolver(event)
  const { resolveAction: resolveAssignmentAction, modal: assignModal } =
    useAssignmentActionConfigurationResolver(event)

  const { customActionModal, customActionConfigs } =
    useCustomActionConfigs(event)

  const actions = useMemo(
    () =>
      ActionMenuActionType.options.map((actionType) => {
        if (
          actionType === ActionType.ASSIGN ||
          actionType === ActionType.UNASSIGN
        ) {
          return resolveAssignmentAction(actionType)
        }

        return resolveAction(actionType)
      }),
    [resolveAction, resolveAssignmentAction]
  )

  return {
    modals: [[...eventModals, assignModal], customActionModal],
    actions: [...actions, ...customActionConfigs]
  }
}
