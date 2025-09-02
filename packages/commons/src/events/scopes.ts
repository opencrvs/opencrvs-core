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
import { intersection } from 'lodash'
import {
  ConfigurableScopeType,
  findScope,
  getAuthorizedEventsFromScopes,
  Scope
} from '../scopes'
import {
  ClientSpecificAction,
  ActionType,
  DisplayableAction
} from './ActionType'

// This defines the mapping between event actions and the scopes required to perform them.
export const ACTION_SCOPE_MAP = {
  [ActionType.READ]: ['record.declare', 'record.notify'],
  [ActionType.CREATE]: ['record.declare', 'record.notify'],
  [ActionType.NOTIFY]: ['record.notify'],
  [ActionType.DECLARE]: [
    'record.declare',
    'record.declared.validate',
    'record.register'
  ],
  [ActionType.DELETE]: ['record.declare'],
  [ActionType.VALIDATE]: ['record.declared.validate', 'record.register'],
  [ActionType.REGISTER]: ['record.register'],
  [ActionType.PRINT_CERTIFICATE]: ['record.registered.print-certified-copies'],
  [ActionType.REQUEST_CORRECTION]: [
    'record.registered.request-correction',
    'record.registered.correct'
  ],
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: [
    'record.registered.correct'
  ],
  [ActionType.REJECT_CORRECTION]: ['record.registered.correct'],
  [ActionType.APPROVE_CORRECTION]: ['record.registered.correct'],
  [ActionType.MARKED_AS_DUPLICATE]: ['record.declared.archive'],
  [ActionType.ARCHIVE]: ['record.declared.archive'],
  [ActionType.REJECT]: ['record.declared.reject'],
  [ActionType.ASSIGN]: [],
  [ActionType.UNASSIGN]: [],
  [ActionType.DETECT_DUPLICATE]: []
} satisfies Record<DisplayableAction, ConfigurableScopeType[]>

export function hasAnyOfScopes(a: Scope[], b: Scope[]) {
  return intersection(a, b).length > 0
}

/**
 * Checks if a given action is allowed for the provided scopes and event type.
 *
 * This function determines whether the user, with the given set of scopes, is authorized
 * to perform the specified action on an event of the given type. It checks both "plain" scopes
 * (hardcoded, non-configurable) and "configurable" scopes (which may be tied to specific event types).
 *
 * @param {Scope[]} scopes - The list of scopes the user possesses.
 * @param {DisplayableAction} action - The action to check authorization for.
 * @param {string} eventType - The type of event for which the action is being checked.
 * @returns {boolean} True if the action is in scope for the user, otherwise false.
 */
export function isActionInScope(
  scopes: Scope[],
  action: DisplayableAction,
  eventType: string
) {
  const allowedConfigurableScopes = ACTION_SCOPE_MAP[action]

  if (!allowedConfigurableScopes.length) {
    return false
  }

  // Find the scopes that are authorized for the given action
  const parsedScopes = allowedConfigurableScopes
    .map((scope) => findScope(scopes, scope))
    .filter((scope) => scope !== undefined)

  // Ensure that the given event type is authorized in the found scopes
  const authorizedEvents = getAuthorizedEventsFromScopes(parsedScopes)
  return authorizedEvents.includes(eventType)
}
