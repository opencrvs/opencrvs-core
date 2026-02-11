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
import { useCallback } from 'react'
import {
  ActionType,
  ClientSpecificAction,
  EventIndex,
  getActionConfig,
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useOnlineStatus } from '@client/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { buttonMessages } from '@client/i18n/messages'
import {
  useAssignmentActions,
  useEventActionsOnClick
} from './useEventActionsOnClick'
import {
  ActionCtaConfig,
  actionIcons,
  actionLabels,
  ActionMenuActionType,
  ActionMenuItem
} from './utils'
import { resolveActionConditionals } from './resolveActionConditionals'
import { useUserAllowedActions } from './useUserAllowedActions'

/**
 * Given event, returns resolver function for event action configuration.
 * Used to support both workqueue item CTA button and action menu items.
 *
 * Pattern needs to return a resolver function, since a hook should not be mapped through.
 */
export function useEventActionConfigurationResolver(event: EventIndex) {
  const { getAllRemoteDrafts } = useDrafts()
  const drafts = getAllRemoteDrafts()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { onClick, modals } = useEventActionsOnClick(event)
  const validatorContext = useValidatorContext()
  const { isActionAllowed: isActionAllowedForUser } = useUserAllowedActions(
    event.type
  )

  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)

  const resolveAction = useCallback(
    <T extends WorkqueueActionType | ClientSpecificAction>(
      actionType: T
    ): ActionCtaConfig<T> => {
      const isDeclareDraftOpen = drafts.some(
        (draft) =>
          draft.action.type === ActionType.DECLARE && draft.eventId === event.id
      )

      const { enabled, visible } = resolveActionConditionals({
        event,
        actionType,
        isDeclareDraftOpen,
        validatorContext,
        isActionAllowedForUser,
        eventConfiguration,
        isOnline,
        isDownloaded,
        isAssigning: events.actions.assignment.assign.isAssigning(event.id)
      })

      const actionConfig = getActionConfig({ eventConfiguration, actionType })
      const replaceLabelForDeclareDraft =
        isDeclareDraftOpen && actionType === ActionType.DECLARE

      return {
        label: replaceLabelForDeclareDraft
          ? buttonMessages.update
          : actionLabels[actionType],
        type: actionType,
        icon: actionConfig?.icon || actionIcons[actionType],
        onClick: async (workqueue?: string) => onClick(actionType, workqueue),
        disabled: !enabled,
        hidden: !visible
      }
    },
    [
      drafts,
      event,
      validatorContext,
      isActionAllowedForUser,
      eventConfiguration,
      isOnline,
      isDownloaded,
      events,
      onClick
    ]
  )

  return { resolveAction, modals }
}

/**
 * Given event and action type, determines if the action should be enabled and visible for the user.
 */
export function useResolveActionConditionals(
  event: EventIndex,
  actionType: WorkqueueActionType | ActionMenuActionType,
  isDeclareDraftOpen: boolean
) {
  const validatorContext = useValidatorContext()
  const { isActionAllowed: isActionAllowedForUser } = useUserAllowedActions(
    event.type
  )
  const { eventConfiguration } = useEventConfiguration(event.type)
  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)

  return resolveActionConditionals({
    event,
    actionType,
    isDeclareDraftOpen,
    validatorContext,
    isActionAllowedForUser,
    eventConfiguration,
    isOnline,
    isDownloaded,
    isAssigning: events.actions.assignment.assign.isAssigning(event.id)
  })
}

export function useAssignmentActionVisibility(event: EventIndex) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const validatorContext = useValidatorContext()
  const { isActionAllowed: isActionAllowedForUser } = useUserAllowedActions(
    event.type
  )
  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)

  const resolveVisibility = useCallback(
    (actionType: typeof ActionType.ASSIGN | typeof ActionType.UNASSIGN) => {
      const { enabled, visible } = resolveActionConditionals({
        event,
        actionType,
        isDeclareDraftOpen: false,
        validatorContext,
        isActionAllowedForUser,
        eventConfiguration,
        isOnline,
        isDownloaded,
        isAssigning: events.actions.assignment.assign.isAssigning(event.id)
      })

      return { enabled, visible }
    },
    [
      event,
      validatorContext,
      isActionAllowedForUser,
      eventConfiguration,
      isOnline,
      isDownloaded,
      events
    ]
  )

  return { resolveVisibility }
}

/**
 * Given event, returns resolver function for assignment action configuration.
 * Used to support both workqueue item CTA button and action menu items.
 *
 * Pattern needs to return a resolver function, since a hook should not be mapped through.
 */
export function useAssignmentActionConfigurationResolver(event: EventIndex) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { resolveVisibility } = useAssignmentActionVisibility(event)
  const { onAssign, onUnassign, modal } = useAssignmentActions(event)

  const resolveAction = useCallback(
    (
      actionType: typeof ActionType.ASSIGN | typeof ActionType.UNASSIGN
    ): ActionMenuItem => {
      const { enabled, visible } = resolveVisibility(actionType)
      const actionConfig = getActionConfig({ eventConfiguration, actionType })

      return {
        label: actionLabels[actionType],
        type: actionType,
        icon: actionConfig?.icon || actionIcons[actionType],
        onClick:
          actionType === ActionType.ASSIGN
            ? async () => onAssign()
            : async () => onUnassign(),
        disabled: !enabled,
        hidden: !visible
      }
    },
    [resolveVisibility, eventConfiguration, onAssign, onUnassign]
  )

  return { resolveAction, modal }
}
