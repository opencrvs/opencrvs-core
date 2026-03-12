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
  getAuthorizedEventsFromScopes,
  Scope,
  findScopes
} from '../scopes'
import {
  ClientSpecificAction,
  ActionType,
  DisplayableAction
} from './ActionType'
import { getAcceptedScopesByType, RecordScopeTypeV2 } from '../scopes-v2'
import {
  EventIndexWithAdministrativeHierarchy,
  userCanAccessEventWithScopes
} from './locations'
import { UserContext } from '../users/User'
import { EventIndex } from './EventIndex'

type AlwaysAllowed = null

// This defines the mapping between event actions and the scopes required to perform them.
export const ACTION_SCOPE_MAP = {
  [ActionType.READ]: ['record.read'],
  [ActionType.CREATE]: ['record.create'],
  [ActionType.NOTIFY]: ['record.notify'],
  [ActionType.DECLARE]: ['record.declare', 'record.register'],
  [ActionType.EDIT]: ['record.edit'],
  [ActionType.DELETE]: ['record.declare'],
  [ActionType.REGISTER]: ['record.register'],
  [ActionType.PRINT_CERTIFICATE]: ['record.print-certified-copies'],
  [ActionType.REQUEST_CORRECTION]: [
    'record.request-correction',
    'record.correct'
  ],
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: ['record.correct'],
  [ActionType.REJECT_CORRECTION]: ['record.correct'],
  [ActionType.APPROVE_CORRECTION]: ['record.correct'],
  [ActionType.MARK_AS_DUPLICATE]: ['record.review-duplicates'],
  [ActionType.MARK_AS_NOT_DUPLICATE]: ['record.review-duplicates'],
  [ActionType.ARCHIVE]: ['record.archive'],
  [ActionType.REJECT]: ['record.reject'],
  [ActionType.ASSIGN]: null,
  [ActionType.UNASSIGN]: null,
  [ActionType.DUPLICATE_DETECTED]: [],
  [ActionType.CUSTOM]: []
} satisfies Record<DisplayableAction, RecordScopeTypeV2[] | AlwaysAllowed>

export function hasAnyOfScopes(a: Scope[], b: Scope[]) {
  return intersection(a, b).length > 0
}

export function configurableEventScopeAllowed(
  scopes: Scope[],
  allowedConfigurableScopes: ConfigurableScopeType[],
  eventType: string,
  customActionType?: string
) {
  // Find the scopes that are authorized for the given action
  const parsedScopes = allowedConfigurableScopes.flatMap((scope) =>
    findScopes(scopes, scope)
  )

  if (!customActionType) {
    const authorizedEvents = getAuthorizedEventsFromScopes(parsedScopes)
    return authorizedEvents.includes(eventType)
  }

  const scopesWithCorrectCustomActionType = parsedScopes.filter(
    ({ options }) =>
      'customActionType' in options &&
      options.customActionType.includes(customActionType as string)
  )

  const authorizedEvents = getAuthorizedEventsFromScopes(
    scopesWithCorrectCustomActionType
  )

  return authorizedEvents.includes(eventType)
}

export const AssignmentStatus = {
  ASSIGNED_TO_SELF: 'ASSIGNED_TO_SELF',
  ASSIGNED_TO_OTHERS: 'ASSIGNED_TO_OTHERS',
  UNASSIGNED: 'UNASSIGNED'
} as const

export type AssignmentStatus =
  (typeof AssignmentStatus)[keyof typeof AssignmentStatus]

export function getAssignmentStatus(
  eventState: EventIndex | EventIndexWithAdministrativeHierarchy,
  userId: string
): AssignmentStatus {
  if (!eventState.assignedTo) {
    return AssignmentStatus.UNASSIGNED
  }

  return eventState.assignedTo == userId
    ? AssignmentStatus.ASSIGNED_TO_SELF
    : AssignmentStatus.ASSIGNED_TO_OTHERS
}

/**
 * Checks if a given action is allowed for the provided scopes, event, and user context.
 *
 * This function determines whether the user, with the given set of scopes, is authorized
 * to perform the specified action on the given event. It checks both legacy V1 scopes
 * (hardcoded, non-configurable) and V2 scopes, which validate event type, jurisdiction,
 * and user context via {@link userCanAccessEventWithScopes}.
 *
 * @param {Scope[]} scopes - The raw encoded scope strings the user possesses (from JWT).
 * @param {DisplayableAction} action - The action to check authorization for.
 * @param {EventIndexWithAdministrativeHierarchy} event - The event with resolved administrative hierarchy.
 * @param {UserContext} currentUser - The current user's context used for V2 scope validation.
 * @param {string} [customActionType] - Optional custom action type for CUSTOM actions.
 * @returns {boolean} True if the action is in scope for the user, otherwise false.
 */
export function isActionInScope({
  scopes,
  action,
  event,
  currentUser,
  customActionType
}: {
  scopes: Scope[]
  action: DisplayableAction
  event: EventIndexWithAdministrativeHierarchy
  currentUser: UserContext
  customActionType?: string
}): boolean {
  const assignmentStatus = getAssignmentStatus(event, currentUser.id)
  /**
   * Anyone can unassign themselves. However, to unassign others, the user must have the 'record.unassign-others' scope.
   * This is a special case that deviates from the general pattern of scope checks defined in ACTION_SCOPE_MAP.
   * Therefore, we check for this condition explicitly here.
   */
  const isUnassigningOthers =
    action === ActionType.UNASSIGN &&
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_OTHERS

  const allowedConfigurableScopes = isUnassigningOthers
    ? ['record.unassign-others']
    : ACTION_SCOPE_MAP[action]

  // 'null' means that the action is always allowed
  if (allowedConfigurableScopes === null) {
    return true
  }

  // Empty array means that the action is never allowed
  if (!allowedConfigurableScopes.length) {
    return false
  }

  const isAllowedByLegacyScope = configurableEventScopeAllowed(
    scopes,
    // @ts-expect-error - TODO: remove legacy scopes once evrything is migrated to V2
    allowedConfigurableScopes,
    event.type,
    customActionType
  )

  // @TODO
  // NOTE: This is a temporary measure to allow for the transition to V2 scopes.
  // This will be unified to single check once the V1 scopes are fully deprecated and removed.
  const matchingScopes = getAcceptedScopesByType({
    acceptedScopes: allowedConfigurableScopes as RecordScopeTypeV2[],
    scopes
  })

  const isAllowedByV2Scope = userCanAccessEventWithScopes(
    event,
    matchingScopes,
    {
      id: currentUser.id,
      primaryOfficeId: currentUser.primaryOfficeId,
      administrativeAreaId: currentUser.administrativeAreaId ?? null,
      role: currentUser.role,
      signature: currentUser.signature,
      type: currentUser.type
    }
  )

  return isAllowedByLegacyScope || isAllowedByV2Scope
}
