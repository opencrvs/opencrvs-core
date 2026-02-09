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
  CtaActionType,
  EventIndex,
  getActionConfig
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useOnlineStatus } from '@client/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useUserAllowedActions } from './useUserAllowedActions'
import { actionIcons, actionLabels, ActionMenuItem } from './utils'
import { useEventActionsOnClick } from './useActionOnClick'
import { resolveActionConditionals } from './resolveActionConditionals'

const reviewLabel = {
  id: 'buttons.review',
  defaultMessage: 'Review',
  description: 'Label for review CTA button'
}

/**
 * Given event, returns resolver function for action configuration.
 * Used to support both workqueue item CTA button and action menu items.
 *
 * Pattern needs to return a resolver function, since a hook should not be mapped through.
 */
export function useActionConfigurationResolver(event: EventIndex) {
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
    (actionType: CtaActionType): ActionMenuItem => {
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
          ? reviewLabel
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
