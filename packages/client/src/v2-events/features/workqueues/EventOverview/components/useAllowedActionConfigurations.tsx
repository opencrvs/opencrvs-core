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
import React, { useMemo } from 'react'
import {
  ActionType,
  EventIndex,
  EventStatus,
  isMetaAction,
  getAvailableActionsForEvent,
  ClientSpecificAction,
  workqueueActions,
  configurableEventScopeAllowed,
  ITokenPayload,
  isActionEnabled,
  isActionVisible,
  getActionConfig,
  ValidatorContext,
  EventConfig
} from '@opencrvs/commons/client'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useUserAllowedActions } from './useUserAllowedActions'
import { ActionMenuItem, ActionMenuActionType, ActionConfig } from './utils'
import { useCustomActionConfigs } from './useCustomActionConfigs'
import { useViewableActionConfigurations } from './useViewableActionConfigurations'

const STATUSES_THAT_CAN_BE_ASSIGNED: EventStatus[] = [
  EventStatus.enum.NOTIFIED,
  EventStatus.enum.DECLARED,
  EventStatus.enum.REGISTERED,
  EventStatus.enum.ARCHIVED
]

function getAvailableAssignmentActions(
  event: EventIndex,
  authentication: ITokenPayload
) {
  const assignmentStatus = getAssignmentStatus(event, authentication.sub)
  const eventStatus = event.status

  const mayUnassignOthers = configurableEventScopeAllowed(
    authentication.scope,
    ['record.unassign-others'],
    event.type
  )

  if (!STATUSES_THAT_CAN_BE_ASSIGNED.includes(eventStatus)) {
    return []
  }

  if (assignmentStatus === AssignmentStatus.UNASSIGNED) {
    return [ActionType.ASSIGN]
  }

  if (
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_OTHERS &&
    mayUnassignOthers
  ) {
    return [ActionType.UNASSIGN]
  }

  if (assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF) {
    return [ActionType.UNASSIGN]
  }

  return []
}

/** Actions might have configured SHOW or ENABLE conditionals. Let's apply their effects here. */
function applyActionConditionalEffects({
  event,
  action,
  validatorContext,
  eventConfiguration
}: {
  event: EventIndex
  action: ActionMenuItem
  validatorContext: ValidatorContext
  eventConfiguration: EventConfig
}) {
  const actionConfig = getActionConfig({
    eventConfiguration,
    actionType: action.type as ActionType,
    customActionType:
      'customActionType' in action ? action.customActionType : undefined
  })

  if (!actionConfig || !actionConfig.conditionals) {
    return action
  }

  const hidden = !isActionVisible(actionConfig, event, validatorContext)
  const disabled = !isActionEnabled(actionConfig, event, validatorContext)

  return {
    ...action,
    hidden: action.hidden || hidden,
    disabled: action.disabled || disabled
  }
}

/**
 *
 * NOTE: In principle, you should never add new business rules to the `useAction` hook alone. All the actions are validated by the server and their order is enforced.
 * Each action has their own route and will take care of the actions needed. If you "skip" action (e.g. showing 'REGISTER' instead of 'DECLARE') by directing the user to the wrong route, it will fail at the end.
 *
 * @returns a tuple containing a modal (which must be rendered in the parent where this hook is called) and a list of action menu items based on the event state and scopes provided.
 */
export function useAllowedActionConfigurations(
  event: EventIndex,
  authentication: ITokenPayload
): [React.ReactNode, ActionMenuItem[]] {
  console.time(`${event.id} - TOTAL`)

  console.time(`${event.id} - 1. flags check`)
  const isPending = event.flags.some((flag) => flag.endsWith(':requested'))
  console.timeEnd(`${event.id} - 1. flags check`)

  console.time(`${event.id} - 2. useUserAllowedActions`)
  const { isActionAllowed } = useUserAllowedActions(event.type)
  console.timeEnd(`${event.id} - 2. useUserAllowedActions`)

  console.time(`${event.id} - 3. useDrafts`)
  const drafts = useDrafts()
  console.timeEnd(`${event.id} - 3. useDrafts`)

  console.time(`${event.id} - 4. useValidatorContext`)
  const validatorContext = useValidatorContext()
  console.timeEnd(`${event.id} - 4. useValidatorContext`)

  console.time(`${event.id} - 5. useEventConfiguration`)
  const { eventConfiguration } = useEventConfiguration(event.type)
  console.timeEnd(`${event.id} - 5. useEventConfiguration`)

  console.time(`${event.id} - 6. find openDraft`)
  const openDraft = drafts
    .getAllRemoteDrafts()
    .find((draft) => draft.eventId === event.id)
  console.timeEnd(`${event.id} - 6. find openDraft`)

  console.time(`${event.id} - 7. useViewableActionConfigurations`)
  const { config, modals } = useViewableActionConfigurations(
    event,
    authentication,
    openDraft
  )
  console.timeEnd(`${event.id} - 7. useViewableActionConfigurations`)

  console.time(`${event.id} - 8. allowedActionConfigs useMemo`)
  const allowedActionConfigs: ActionMenuItem[] = useMemo(() => {
    console.time(`${event.id} - 8a. getAvailableAssignmentActions`)
    const availableAssignmentActions = getAvailableAssignmentActions(
      event,
      authentication
    )
    console.timeEnd(`${event.id} - 8a. getAvailableAssignmentActions`)

    console.time(`${event.id} - 8b. getAvailableActionsForEvent`)
    const availableEventActions = getAvailableActionsForEvent(event)
    console.timeEnd(`${event.id} - 8b. getAvailableActionsForEvent`)

    const openDraftAction = openDraft ? [openDraft.action.type] : []

    console.time(`${event.id} - 8c. filter and map`)
    const result = [
      ...availableAssignmentActions,
      ...availableEventActions,
      ...openDraftAction
    ]
      .filter((action, index, self) => self.indexOf(action) === index)
      .filter(
        (action): action is ActionMenuActionType =>
          ClientSpecificAction.REVIEW_CORRECTION_REQUEST === action ||
          workqueueActions.safeParse(action).success
      )
      .filter((action) => isActionAllowed(action))
      .map((a) => ({ ...config[a], type: a }))
    console.timeEnd(`${event.id} - 8c. filter and map`)
    return result
  }, [openDraft, config, isActionAllowed, event, authentication])
  console.timeEnd(`${event.id} - 8. allowedActionConfigs useMemo`)

  console.time(`${event.id} - 9. useCustomActionConfigs`)
  const { customActionModal, customActionConfigs } = useCustomActionConfigs(
    event,
    authentication
  )
  console.timeEnd(`${event.id} - 9. useCustomActionConfigs`)

  console.time(`${event.id} - 10. applyActionConditionalEffects`)
  const allActionConfigs = [...allowedActionConfigs, ...customActionConfigs]
    .map((action) =>
      applyActionConditionalEffects({
        event,
        action,
        validatorContext,
        eventConfiguration
      })
    )
    .filter((a: ActionConfig) => !a.hidden)
  console.timeEnd(`${event.id} - 10. applyActionConditionalEffects`)

  console.time(`${event.id} - 11. hasOnlyMetaActions`)
  const hasOnlyMetaActions = allActionConfigs.every(({ type }) =>
    isMetaAction(type)
  )
  console.timeEnd(`${event.id} - 11. hasOnlyMetaActions`)

  if (isPending) {
    return [null, []]
  }

  console.timeEnd(`${event.id} - TOTAL`)

  return [
    [modals, customActionModal],
    hasOnlyMetaActions ? [] : allActionConfigs
  ]
}
