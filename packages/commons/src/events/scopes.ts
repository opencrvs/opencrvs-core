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
  Scope,
  SCOPES
} from '../scopes'
import {
  ClientSpecificAction,
  ActionType,
  DisplayableAction
} from './ActionType'

type RequiresNoScope = null
type NotAvailableAsAction = [] // pseudo actions

type RequiresAnyOfScopes = [Scope, ...Scope[]]
type RequiredScopes =
  | RequiresAnyOfScopes
  | RequiresNoScope
  | NotAvailableAsAction

export const ACTION_ALLOWED_SCOPES = {
  [ActionType.READ]: [
    SCOPES.RECORD_READ,
    // TODO CIHAN: maybe remove submit for review?
    SCOPES.RECORD_SUBMIT_FOR_REVIEW,
    SCOPES.RECORD_REGISTER,
    SCOPES.RECORD_EXPORT_RECORDS
  ],
  [ActionType.CREATE]: [SCOPES.RECORD_SUBMIT_FOR_REVIEW],
  [ActionType.NOTIFY]: [],
  [ActionType.DECLARE]: [],
  [ActionType.DELETE]: [],
  [ActionType.VALIDATE]: [],
  [ActionType.REGISTER]: [],
  [ActionType.PRINT_CERTIFICATE]: [],
  [ActionType.REQUEST_CORRECTION]: [],
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: [],
  [ActionType.REJECT_CORRECTION]: [],
  [ActionType.APPROVE_CORRECTION]: [],
  [ActionType.MARKED_AS_DUPLICATE]: [],
  [ActionType.ARCHIVE]: [],
  [ActionType.REJECT]: [],
  [ActionType.ASSIGN]: null,
  [ActionType.UNASSIGN]: null,
  [ActionType.DETECT_DUPLICATE]: []
} satisfies Record<DisplayableAction, RequiredScopes>

// TODO CIHAN: can we merge this with the ACTION_ALLOWED_SCOPES?
export const ACTION_ALLOWED_CONFIGURABLE_SCOPES = {
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
  const allowedPlainScopes = ACTION_ALLOWED_SCOPES[action]
  const allowedConfigurableScopes = ACTION_ALLOWED_CONFIGURABLE_SCOPES[action]

  if (allowedPlainScopes === null) {
    return true
  }

  if (hasAnyOfScopes(scopes, allowedPlainScopes)) {
    return true
  }

  if (allowedConfigurableScopes.length > 0) {
    const parsedScopes = allowedConfigurableScopes
      .map((scope) => findScope(scopes, scope))
      .filter((scope) => scope !== undefined)

    const authorizedEvents = getAuthorizedEventsFromScopes(parsedScopes)

    if (authorizedEvents.includes(eventType)) {
      return true
    }
  }

  return false
}
