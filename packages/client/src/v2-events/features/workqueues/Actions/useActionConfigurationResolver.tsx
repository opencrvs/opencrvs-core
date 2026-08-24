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
  WorkqueueActionType,
  isValidIcon
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useOnlineStatus } from '@client/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { buttonMessages } from '@client/i18n/messages'
import { useDuplicatesAvailable } from '@client/v2-events/features/events/actions/dedup/useDuplicatesAvailable'
import {
  useAssignmentActions,
  useEventActionsOnClick
} from './useEventActionsOnClick'
import {
  ActionCtaConfig,
  actionIcons,
  actionLabels,
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
  const { getDisplayableDrafts } = useDrafts()
  const drafts = getDisplayableDrafts()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { onClick, modals } = useEventActionsOnClick(event)
  const { isActionAllowed: isActionAllowedForUser } =
    useUserAllowedActions(event)

  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)
  const validatorContext = useValidatorContext(cachedEvent.data)
  const isAssigning = events.actions.assignment.assign.isAssigning(event.id)
  const areDuplicatesAvailable = useDuplicatesAvailable(event)

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
        isAssigning,
        areDuplicatesAvailable
      })

      const actionConfig = getActionConfig({ eventConfiguration, actionType })
      const replaceLabelForDeclareDraft =
        isDeclareDraftOpen && actionType === ActionType.DECLARE

      return {
        label: replaceLabelForDeclareDraft
          ? buttonMessages.update
          : (actionConfig?.label ?? actionLabels[actionType]),
        type: actionType,
        icon: isValidIcon(actionConfig?.icon)
          ? actionConfig.icon
          : actionIcons[actionType],
        onClick: async (backTo?: string) => onClick(actionType, backTo),
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
      isAssigning,
      areDuplicatesAvailable,
      onClick
    ]
  )

  return { resolveAction, modals }
}

/**
 *
 * Given event,
 * @returns resolver function for assignment (and READ) action configuration conditionals.
 *
 * Separated from {@link useEventActionConfigurationResolver} due to limited
 * use and poor-ish performance in list views — it skips the costly
 * `useEventActionsOnClick`, so it's safe to call from components rendered
 * per-row (e.g. `DownloadButton`), unlike the full resolver.
 */
export function useResolveAssignmentActionConditionals(event: EventIndex) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { isActionAllowed: isActionAllowedForUser } =
    useUserAllowedActions(event)
  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)
  const validatorContext = useValidatorContext(cachedEvent.data)
  const isAssigning = events.actions.assignment.assign.isAssigning(event.id)

  const resolveConditionals = useCallback(
    (
      actionType:
        | typeof ActionType.ASSIGN
        | typeof ActionType.UNASSIGN
        | typeof ActionType.READ
    ) => {
      const { enabled, visible } = resolveActionConditionals({
        event,
        actionType,
        isDeclareDraftOpen: false,
        validatorContext,
        isActionAllowedForUser,
        eventConfiguration,
        isOnline,
        isDownloaded,
        isAssigning
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
      isAssigning
    ]
  )

  return { resolveConditionals }
}

/**
 * Given event, returns resolver function for assignment action configuration.
 * Used to support both workqueue item CTA button and action menu items.
 *
 * Pattern needs to return a resolver function, since a hook should not be mapped through.
 */
export function useAssignmentActionConfigurationResolver(event: EventIndex) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { resolveConditionals } = useResolveAssignmentActionConditionals(event)
  const { onAssign, onUnassign, modal } = useAssignmentActions(event)

  const resolveAction = useCallback(
    (
      actionType: typeof ActionType.ASSIGN | typeof ActionType.UNASSIGN
    ): ActionMenuItem => {
      const { enabled, visible } = resolveConditionals(actionType)
      const actionConfig = getActionConfig({ eventConfiguration, actionType })

      // Assigning always self-assigns and requires `record.read` on the
      // server (accounting for jurisdiction/flags scope options), so it
      // shouldn't be offered unless the user could actually read this event.
      const canRead =
        actionType === ActionType.ASSIGN
          ? resolveConditionals(ActionType.READ)
          : { enabled: true, visible: true }

      return {
        label: actionConfig?.label ?? actionLabels[actionType],
        type: actionType,
        icon: isValidIcon(actionConfig?.icon)
          ? actionConfig.icon
          : actionIcons[actionType],
        onClick:
          actionType === ActionType.ASSIGN
            ? async () => onAssign()
            : async () => onUnassign(),
        disabled: !(enabled && canRead.enabled),
        hidden: !(visible && canRead.visible)
      }
    },
    [resolveConditionals, eventConfiguration, onAssign, onUnassign]
  )

  return { resolveAction, modal }
}
