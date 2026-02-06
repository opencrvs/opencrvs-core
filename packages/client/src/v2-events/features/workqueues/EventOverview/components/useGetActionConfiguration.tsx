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
  CtaActionType,
  EventIndex,
  getActionConfig,
  getAvailableActionsForEvent,
  getOrThrow,
  isActionEnabled,
  isActionVisible
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useUserAllowedActions } from './useUserAllowedActions'
import { actionLabels, ActionMenuItem } from './utils'
import { useActionOnClick } from './useActionOnClick'
import { getAvailableAssignmentActions } from './useAllowedActionConfigurations'

/**
 * Given event and action type, determines if the action should be enabled and visible for the user.
 */
export function useResolveActionConditionals(
  event: EventIndex,
  actionType: CtaActionType
) {
  const validatorContext = useValidatorContext()
  const { isActionAllowed } = useUserAllowedActions(event.type)
  // @todo: come up with a name or single method for these. Confusing that they are separate but both required to determine if an action is enabled/visible.
  const availableEventActions = getAvailableActionsForEvent(event)
  const availableAssignActions = getAvailableAssignmentActions(
    event,
    getOrThrow(
      validatorContext.user,
      'User information is required in validator context to determine assignment actions'
    )
  )
  const allAvailableActions = useMemo(
    () => [...availableEventActions, ...availableAssignActions],
    [availableEventActions, availableAssignActions]
  )
  const { eventConfiguration } = useEventConfiguration(event.type)

  const actionIsAvailableForEvent = allAvailableActions.includes(actionType)
  const actionIsAllowedForUser = isActionAllowed(actionType)
  const actionConfig = getActionConfig({ eventConfiguration, actionType })

  // @todo: should it default to true? Seems to match assign & unassign specifically.
  const isVisible = actionConfig
    ? isActionVisible(actionConfig, event, validatorContext)
    : true

  const isEnabled = actionConfig
    ? isActionEnabled(actionConfig, event, validatorContext)
    : true

  return {
    enabled: actionIsAvailableForEvent && actionIsAllowedForUser && isEnabled,
    visible: isVisible
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
