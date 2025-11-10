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
import { Action, ActionStatus } from '../ActionDocument'
import { ActionType, isMetaAction } from '../ActionType'
import { EventStatus } from '../EventMetadata'
import { InherentFlags, Flag } from '../Flag'
import { EventConfig } from '../EventConfig'
import { aggregateActionDeclarations } from '../utils'

function isPendingCertification(actions: Action[]) {
  if (getStatusFromActions(actions) !== EventStatus.enum.REGISTERED) {
    return false
  }

  return actions.reduce<boolean>((prev, { type }) => {
    if (type === ActionType.PRINT_CERTIFICATE) {
      return false
    }
    if (type === ActionType.APPROVE_CORRECTION) {
      return true
    }
    return prev
  }, true)
}

function isCorrectionRequested(actions: Action[]) {
  return actions.reduce<boolean>((prev, { type }) => {
    if (type === ActionType.REQUEST_CORRECTION) {
      return true
    }
    if (type === ActionType.APPROVE_CORRECTION) {
      return false
    }
    if (type === ActionType.REJECT_CORRECTION) {
      return false
    }
    return prev
  }, false)
}

function isDeclarationIncomplete(actions: Action[]): boolean {
  return getStatusFromActions(actions) === EventStatus.enum.NOTIFIED
}

function isRejected(actions: Action[]): boolean {
  return actions.at(-1)?.type === ActionType.REJECT
}

function isPotentialDuplicate(actions: Action[]): boolean {
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

export function resolveCustomFlagsFromActions(
  actions: Action[],
  config: EventConfig
): Flag[] {
  return actions.reduce((acc, action, idx) => {
    const actionConfig = config.actions.find((a) => a.type === action.type)

    if (!actionConfig) {
      return acc
    }

    const declaration = aggregateActionDeclarations(actions.slice(0, idx))
    const annotation = aggregateActionDeclarations(actions.slice(0, idx))

    const form = { ...declaration, ...annotation }

    console.log('form that should be used in conditional?', form)

    const addedFlags = actionConfig.flags
      .filter(({ operation }) => operation === 'add')
      // .filter(({ conditional }) => conditional)
      // TODO resolve conditionals
      .map(({ id }) => id)

    const removedFlags = actionConfig.flags
      .filter(({ operation }) => operation === 'remove')
      // TODO resolve conditionals
      .map(({ id }) => id)

    // Add and remove flags
    const flags = [...acc, ...addedFlags].filter(
      (flag) => !removedFlags.includes(flag)
    )

    return uniq(flags)
  }, [] as Flag[])
}

export function getFlagsFromActions(
  actions: Action[],
  config: EventConfig
): Flag[] {
  const sortedActions = actions
    .filter(({ type }) => !isMetaAction(type))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

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
  const flags = Object.entries(actionStatus)
    .filter(([, status]) => status !== ActionStatus.Accepted)
    .map(([type, status]) => {
      const flag = joinValues([type, status], ':').toLowerCase()
      return flag satisfies Flag
    })

  if (isPendingCertification(sortedActions)) {
    flags.push(InherentFlags.PENDING_CERTIFICATION)
  }
  if (isCorrectionRequested(sortedActions)) {
    flags.push(InherentFlags.CORRECTION_REQUESTED)
  }
  if (isDeclarationIncomplete(sortedActions)) {
    flags.push(InherentFlags.INCOMPLETE)
  }
  if (isRejected(sortedActions)) {
    flags.push(InherentFlags.REJECTED)
  }
  if (isPotentialDuplicate(sortedActions)) {
    flags.push(InherentFlags.POTENTIAL_DUPLICATE)
  }

  return [...flags, ...resolveCustomFlagsFromActions(sortedActions, config)]
}
