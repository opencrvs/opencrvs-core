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

import { uniq } from 'lodash'
import { joinValues } from '../../utils'
import { getStatusFromActions } from '.'
import {
  Action,
  ActionStatus,
  EventState,
  RequestedCorrectionAction
} from '../ActionDocument'
import { ActionType, isMetaAction } from '../ActionType'
import { EventStatus } from '../EventMetadata'
import { InherentFlags, Flag, CustomFlag, ActionFlag } from '../Flag'
import { EventConfig } from '../EventConfig'
import {
  aggregateActionAnnotations,
  aggregateActionDeclarations,
  getAcceptedActions,
  getActionConfig,
  isActionConfigType
} from '../utils'
import { formatISO, parseISO, isValid } from 'date-fns'
import { EventDocument } from '../EventDocument'
import { JSONSchema } from '../../conditionals/conditionals'
import { validate } from '../../conditionals/validate'

function isEditInProgress(actions: Action[]) {
  return actions.at(-1)?.type === ActionType.EDIT
}

// Walk from the end: the latest correction-lifecycle action determines state.
// If it's an APPROVE/REJECT_CORRECTION, there is no pending request.
// If it's a REQUEST_CORRECTION, that's the pending one we want.
export function findPendingCorrectionAction(
  writeActions: Action[]
): RequestedCorrectionAction | undefined {
  let correctionRequestAction: RequestedCorrectionAction | undefined
  for (let i = writeActions.length - 1; i >= 0; i--) {
    const action = writeActions[i]
    if (
      action.type === ActionType.APPROVE_CORRECTION ||
      action.type === ActionType.REJECT_CORRECTION
    ) {
      break
    }
    if (action.type === ActionType.REQUEST_CORRECTION) {
      correctionRequestAction = action as RequestedCorrectionAction
      break
    }
  }

  return correctionRequestAction
}

function isCorrectionRequested(actions: Action[]) {
  return findPendingCorrectionAction(actions) !== undefined
}

function isDeclarationIncomplete(actions: Action[]): boolean {
  return getStatusFromActions(actions) === EventStatus.enum.NOTIFIED
}

function isRejected(actions: Action[]): boolean {
  const resettingActionTypes: ActionType[] = [
    ActionType.NOTIFY,
    ActionType.DECLARE,
    ActionType.EDIT,
    ActionType.REGISTER,
    ActionType.ARCHIVE
  ]

  return actions.reduce<boolean>((prev, { type }) => {
    if (type === ActionType.REJECT) {
      return true
    }
    if (resettingActionTypes.includes(type)) {
      return false
    }
    return prev
  }, false)
}

export function isPotentialDuplicate(actions: Action[]): boolean {
  return actions.reduce<boolean>((prev, { type }) => {
    if (type === ActionType.DUPLICATE_DETECTED) {
      return true
    }
    if (
      type === ActionType.MARK_AS_NOT_DUPLICATE ||
      type === ActionType.MARK_AS_DUPLICATE
    ) {
      return false
    }
    return prev
  }, false)
}

function isFlagConditionMet(
  conditional: JSONSchema,
  form: EventState,
  action: Action
) {
  const now = isValid(parseISO(action.createdAt))
    ? formatISO(parseISO(action.createdAt), { representation: 'date' })
    : formatISO(new Date(), { representation: 'date' })

  return validate(conditional, {
    $form: form,
    $now: now,
    $online: true,
    $user: {
      sub: '',
      exp: '',
      role: action.createdByRole,
      algorithm: '',
      scope: [],
      userType: action.createdByUserType
    }
  })
}

/**
 * This function resolves custom flags for an event based on its actions.
 * Flags are not stored to the event state or any database directly, instead they are always computed/evaluated from the event actions.
 *
 * Processes accepted actions in chronological order, evaluating flag conditions
 * at each action step. Flags can be added or removed based on action configurations
 * and conditional logic. Duplicate flags are filtered out.
 *
 * @param event - The event document containing actions and metadata
 * @param eventConfiguration - The configuration object for the event type defining action rules and flag behaviors
 * @returns An array of unique custom flag IDs that apply to the event after processing all non-meta actions
 *
 * @example
 * const flags = resolveEventCustomFlags(eventDoc, config);
 * // Returns: ['flag-1', 'flag-3']
 */
export function resolveEventCustomFlags(
  event: EventDocument,
  eventConfiguration: EventConfig
): CustomFlag[] {
  const actions = getAcceptedActions(event)
    .filter(({ type }) => !isMetaAction(type))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return actions.reduce<CustomFlag[]>((acc, action, idx) => {
    let actionConfig
    if (isActionConfigType(action.type)) {
      actionConfig = getActionConfig({
        eventConfiguration,
        actionType: action.type,
        customActionType:
          'customActionType' in action ? action.customActionType : undefined
      })
    }

    if (!actionConfig) {
      return acc
    }

    const eventUpToThisAction = {
      ...event,
      actions: actions.slice(0, idx + 1)
    }

    const declaration = aggregateActionDeclarations(eventUpToThisAction)
    const annotation = aggregateActionAnnotations(eventUpToThisAction)
    const form = { ...declaration, ...annotation }

    const flagsWithMetConditions = actionConfig.flags.filter(
      ({ conditional }) =>
        // If conditional is not provided, the flag is resolved
        conditional ? isFlagConditionMet(conditional, form, action) : true
    )

    const addedFlags = flagsWithMetConditions
      .filter(({ operation }) => operation === 'add')
      .map(({ id }) => id)

    const removedFlags = flagsWithMetConditions
      .filter(({ operation }) => operation === 'remove')
      .map(({ id }) => id)

    // Add and remove flags
    const flags = [...acc, ...addedFlags].filter(
      (flagId) => !removedFlags.includes(flagId)
    )

    return uniq(flags)
  }, [])
}

function getActionStatusFlags(sortedActions: Action[]): ActionFlag[] {
  const actionStatus = sortedActions.reduce<
    Partial<Record<ActionType, ActionStatus>>
  >(
    (actionStatuses, { type, status }) => ({
      ...actionStatuses,
      [type]: status
    }),
    {}
  )

  /**
   * Adds two types of flags:
   *  - `ACTION:requested` : An action sent which is not yet accepted or rejected by country config.
   *  - `ACTION:rejected`  : An action which was rejected by country config.
   */
  return Object.entries(actionStatus)
    .filter(([, status]) => status !== ActionStatus.Accepted)
    .map(([type, status]) => {
      const flag = joinValues([type, status], ':').toLowerCase()
      return flag satisfies ActionFlag
    })
}

function getInherentFlags(sortedActions: Action[]): InherentFlags[] {
  // For determining InherentFlags, we should only consider accepted actions.
  const acceptedActions = sortedActions.filter(
    ({ status }) => status === ActionStatus.Accepted
  )

  const inherentFlags: InherentFlags[] = []

  if (isCorrectionRequested(acceptedActions)) {
    inherentFlags.push(InherentFlags.CORRECTION_REQUESTED)
  }
  if (isDeclarationIncomplete(acceptedActions)) {
    inherentFlags.push(InherentFlags.INCOMPLETE)
  }
  if (isRejected(acceptedActions)) {
    inherentFlags.push(InherentFlags.REJECTED)
  }
  if (isPotentialDuplicate(acceptedActions)) {
    inherentFlags.push(InherentFlags.POTENTIAL_DUPLICATE)
  }
  if (isEditInProgress(acceptedActions)) {
    inherentFlags.push(InherentFlags.EDIT_IN_PROGRESS)
  }

  return inherentFlags
}

/**
 * Computes all flags (inherent, action status, and custom) that should be attached to the given event,
 * based on its actions and event-specific configuration.
 *
 * Flags are determined by combining:
 *  - Action status flags (format 'ActionType:ActionStatus')
 *  - Inherent flags (e.g. incomplete, rejected, correction requested, potential duplicate, edit in progress)
 *  - Event type-specific custom flags defined in the event configuration
 *
 * @param event - The EventDocument containing the action history and payload
 * @param config - The EventConfig providing rules for custom flag evaluation
 * @returns An array of flags currently relevant/applicable to the event
 */
export function getEventFlags(
  event: EventDocument,
  config: EventConfig
): Flag[] {
  const sortedActions = event.actions
    .filter(({ type }) => !isMetaAction(type))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return [
    ...getActionStatusFlags(sortedActions),
    ...getInherentFlags(sortedActions),
    ...resolveEventCustomFlags(event, config)
  ]
}
