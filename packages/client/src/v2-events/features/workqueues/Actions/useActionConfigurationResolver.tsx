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
  isValidIcon
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useOnlineStatus } from '@client/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import {
  DuplicatesAvailability,
  useDuplicatesAvailable
} from '@client/v2-events/features/events/actions/dedup/useDuplicatesAvailable'
import {
  DraftActionType,
  useAssignmentActions,
  useEventActionsOnClick
} from './useEventActionsOnClick'
import {
  ActionCtaConfig,
  actionIcons,
  actionLabels,
  ActionMenuItem,
  WorkqueueCtaType
} from './utils'
import {
  resolveActionConditionals,
  resolveBaseActionConditionals
} from './resolveActionConditionals'
import { useUserAllowedActions } from './useUserAllowedActions'

/**
 * Given event, returns resolver function for event action configuration.
 * Used to support both workqueue item CTA button and action menu items.
 *
 * Pattern needs to return a resolver function, since a hook should not be mapped through.
 */
export function useEventActionConfigurationResolver(event: EventIndex) {
  const { useDisplayableDrafts } = useDrafts()
  const drafts = useDisplayableDrafts()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { onClick, continueDraft, modals } = useEventActionsOnClick(event)
  const { isActionAllowed: isActionAllowedForUser } =
    useUserAllowedActions(event)

  const events = useEvents()
  const isOnline = useOnlineStatus()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)
  const validatorContext = useValidatorContext(cachedEvent.data)
  const isAssigning = events.actions.assignment.assign.useIsAssigning(event.id)
  // Don't offer a review that may turn out to have nothing to show.
  const areDuplicatesAvailable =
    useDuplicatesAvailable(
      event,
      isActionAllowedForUser(ActionType.MARK_AS_DUPLICATE)
    ) === DuplicatesAvailability.AVAILABLE

  const draftActionType = drafts
    .filter((draft) => draft.eventId === event.id)
    .map((draft) => draft.action.type)
    .find(
      (type): type is DraftActionType =>
        type === ActionType.DECLARE || type === ActionType.NOTIFY
    )

  const resolveAction = useCallback(
    <T extends WorkqueueCtaType | ClientSpecificAction>(
      actionType: T
    ): ActionCtaConfig<T> => {
      if (actionType === ClientSpecificAction.CONTINUE_DRAFT) {
        // The draft's own action must still be available to the user. A draft opens
        // without assignment or a connection, so the action's internal rules don't apply.
        const { enabled, visible } = draftActionType
          ? resolveBaseActionConditionals({
              event,
              actionType: draftActionType,
              validatorContext,
              isActionAllowedForUser,
              eventConfiguration
            })
          : { enabled: false, visible: false }

        return {
          label: actionLabels[actionType],
          type: actionType,
          icon: actionIcons[actionType],
          onClick: (backTo?: string) =>
            draftActionType && continueDraft(draftActionType, backTo),
          disabled: !enabled,
          hidden: !visible
        }
      }

      const { enabled, visible } = resolveActionConditionals({
        event,
        actionType,
        validatorContext,
        isActionAllowedForUser,
        eventConfiguration,
        isOnline,
        isDownloaded,
        isAssigning,
        areDuplicatesAvailable
      })

      const actionConfig = getActionConfig({ eventConfiguration, actionType })
      // While the user has a draft of the event, Update (CONTINUE_DRAFT) replaces Declare
      const isReplacedByDraft =
        actionType === ActionType.DECLARE && !!draftActionType

      return {
        label: actionConfig?.label ?? actionLabels[actionType],
        type: actionType,
        icon: isValidIcon(actionConfig?.icon)
          ? actionConfig.icon
          : actionIcons[actionType],
        onClick: async (backTo?: string) => onClick(actionType, backTo),
        disabled: !enabled,
        hidden: !visible || isReplacedByDraft
      }
    },
    [
      draftActionType,
      event,
      validatorContext,
      isActionAllowedForUser,
      eventConfiguration,
      isOnline,
      isDownloaded,
      isAssigning,
      areDuplicatesAvailable,
      onClick,
      continueDraft
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
  const isAssigning = events.actions.assignment.assign.useIsAssigning(event.id)

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
