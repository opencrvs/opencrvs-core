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
import {
  Action,
  ActionStatus,
  EventState,
  RequestedCorrectionAction
} from '../ActionDocument'
import { ActionType, isMetaAction } from '../ActionType'
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
 * Returns true if the given action's configuration declares a `remove`
 * operation for `flagId` whose conditional (if any) is met. Used to let
 * configured actions clear inherent flags such as REJECTED.
 */
function actionConfigRemovesFlag(
  action: Action,
  flagId: Flag,
  actionsUpToAndIncluding: Action[],
  event: EventDocument,
  eventConfiguration: EventConfig
): boolean {
  if (!isActionConfigType(action.type)) {
    return false
  }

  const actionConfig = getActionConfig({
    eventConfiguration,
    actionType: action.type,
    customActionType:
      'customActionType' in action ? action.customActionType : undefined
  })

  const removeOperations = (actionConfig?.flags ?? []).filter(
    ({ id, operation }) => id === flagId && operation === 'remove'
  )

  if (removeOperations.length === 0) {
    return false
  }

  const eventUpToThisAction = { ...event, actions: actionsUpToAndIncluding }
  const declaration = aggregateActionDeclarations(eventUpToThisAction)
  const annotation = aggregateActionAnnotations(eventUpToThisAction)
  const form = { ...declaration, ...annotation }

  return removeOperations.some(({ conditional }) =>
    conditional ? isFlagConditionMet(conditional, form, action) : true
  )
}

type InherentFlagRule = {
  flag: InherentFlags
  /** Action types that turn the flag on. */
  setOn: ActionType[]
  /** Action types that turn the flag off. */
  resetOn?: ActionType[]
  /**
   * When true, any action other than `setOn` turns the flag off. Used for
   * "the latest action is X" style flags such as EDIT_IN_PROGRESS.
   */
  resetOnAnyOtherAction?: boolean
}

/**
 * Declarative rules for the inherent flags. Each flag is resolved by replaying
 * the accepted actions chronologically (see resolveInherentFlag). The order of
 * this list determines the order of the resulting flags.
 */
const INHERENT_FLAG_RULES: InherentFlagRule[] = [
  {
    flag: InherentFlags.CORRECTION_REQUESTED,
    setOn: [ActionType.REQUEST_CORRECTION],
    resetOn: [ActionType.APPROVE_CORRECTION, ActionType.REJECT_CORRECTION]
  },
  {
    // INCOMPLETE mirrors the NOTIFIED status: set by NOTIFY, cleared by any
    // other status-changing action (see getStatusFromActions).
    flag: InherentFlags.INCOMPLETE,
    setOn: [ActionType.NOTIFY],
    resetOn: [
      ActionType.CREATE,
      ActionType.DECLARE,
      ActionType.REGISTER,
      ActionType.ARCHIVE
    ]
  },
  {
    flag: InherentFlags.REJECTED,
    setOn: [ActionType.REJECT],
    resetOn: [
      ActionType.NOTIFY,
      ActionType.DECLARE,
      ActionType.EDIT,
      ActionType.REGISTER
    ]
  },
  {
    flag: InherentFlags.POTENTIAL_DUPLICATE,
    setOn: [ActionType.DUPLICATE_DETECTED],
    resetOn: [ActionType.MARK_AS_DUPLICATE, ActionType.MARK_AS_NOT_DUPLICATE]
  },
  {
    flag: InherentFlags.EDIT_IN_PROGRESS,
    setOn: [ActionType.EDIT],
    resetOnAnyOtherAction: true
  }
]

/**
 * Resolves whether a single inherent flag is present by replaying the accepted
 * actions chronologically. The flag is turned on by its `setOn` action types
 * and off by its `resetOn` types (or by any other action when
 * `resetOnAnyOtherAction` is set). In addition, any action whose configuration
 * declares a `remove` operation for the flag clears it — so a country config can
 * clear any inherent flag from a (custom) action (e.g. VALIDATE_DECLARATION
 * clearing REJECTED). Because this is evaluated chronologically, a later action
 * can re-establish a flag that an earlier configured action removed.
 */
function resolveInherentFlag(
  rule: InherentFlagRule,
  acceptedActions: Action[],
  event: EventDocument,
  eventConfiguration: EventConfig
): boolean {
  return acceptedActions.reduce<boolean>((present, action, idx) => {
    if (rule.setOn.includes(action.type)) {
      return true
    }
    if (
      rule.resetOnAnyOtherAction ||
      (rule.resetOn ?? []).includes(action.type)
    ) {
      return false
    }
    if (
      actionConfigRemovesFlag(
        action,
        rule.flag,
        acceptedActions.slice(0, idx + 1),
        event,
        eventConfiguration
      )
    ) {
      return false
    }
    return present
  }, false)
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

function getInherentFlags(
  sortedActions: Action[],
  event: EventDocument,
  eventConfiguration: EventConfig
): InherentFlags[] {
  // For determining InherentFlags, we should only consider accepted actions.
  const acceptedActions = sortedActions.filter(
    ({ status }) => status === ActionStatus.Accepted
  )

  return INHERENT_FLAG_RULES.filter((rule) =>
    resolveInherentFlag(rule, acceptedActions, event, eventConfiguration)
  ).map(({ flag }) => flag)
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
    ...getInherentFlags(sortedActions, event, config),
    ...resolveEventCustomFlags(event, config)
  ]
}
