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
  RecordScopeType,
  Scope
} from '../scopes'
import {
  ClientSpecificAction,
  ActionType,
  DisplayableAction
} from './ActionType'
import { EventIndex } from './EventIndex'
import { CreatedAction } from './ActionDocument'

type AlwaysAllowed = null

// This defines the mapping between event actions and the scopes required to perform them.
export const ACTION_SCOPE_MAP = {
  [ActionType.READ]: ['record.read'],
  [ActionType.CREATE]: ['record.create'],
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
  [ActionType.MARK_AS_DUPLICATE]: ['record.declared.review-duplicates'],
  [ActionType.MARK_AS_NOT_DUPLICATE]: ['record.declared.review-duplicates'],
  [ActionType.ARCHIVE]: ['record.declared.archive'],
  [ActionType.REJECT]: ['record.declared.reject'],
  [ActionType.ASSIGN]: null,
  [ActionType.UNASSIGN]: null,
  [ActionType.DUPLICATE_DETECTED]: []
} satisfies Record<DisplayableAction, RecordScopeType[] | AlwaysAllowed>

export function hasAnyOfScopes(a: Scope[], b: Scope[]) {
  return intersection(a, b).length > 0
}

export function configurableEventScopeAllowed(
  scopes: Scope[],
  allowedConfigurableScopes: ConfigurableScopeType[],
  eventType: string
) {
  // Find the scopes that are authorized for the given action
  const parsedScopes = allowedConfigurableScopes
    .map((scope) => findScope(scopes, scope))
    .filter((scope) => scope !== undefined)

  // Ensure that the given event type is authorized in the found scopes
  const authorizedEvents = getAuthorizedEventsFromScopes(parsedScopes)
  return authorizedEvents.includes(eventType)
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

  // 'null' means that the action is always allowed
  if (allowedConfigurableScopes === null) {
    return true
  }

  // Empty array means that the action is never allowed
  if (!allowedConfigurableScopes.length) {
    return false
  }

  return configurableEventScopeAllowed(
    scopes,
    allowedConfigurableScopes,
    eventType
  )
}

/**
 * A shared utility to check if the user can read a record.
 * This will be removed in 1.10 and implemented by scopes.
 *
 * In order for us to limit the usage of 'record.read' scope, we allow users to view records they have created on system-level.
 *
 * @deprecated - Will be removed in 1.10
 */
export function canUserReadRecord(
  event: EventIndex | CreatedAction,
  {
    userId,
    scopes
  }: {
    userId: string
    scopes: string[]
  }
) {
  const createdByUser = event.createdBy === userId

  if (createdByUser) {
    return true
  }

  return isActionInScope(scopes, ActionType.READ, event.type)
}
