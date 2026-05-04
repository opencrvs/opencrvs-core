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
  ClientSpecificAction,
  ActionType,
  DisplayableAction
} from './ActionType'
import {
  EncodedScope,
  getAcceptedScopesByType,
  RecordScopeTypeV2,
  RecordScopeV2,
  UserScopeV2
} from '../scopes'
import {
  canAccessOtherUserWithScopes,
  EventIndexWithAdministrativeHierarchy,
  userCanAccessEventWithScopes
} from './locations'
import { UserContext } from '../users/User'
import { EventIndex } from './EventIndex'
import { UUID } from 'src/uuid'

type AlwaysAllowed = null

// This defines the mapping between event actions and the scopes required to perform them.
export const ACTION_SCOPE_MAP = {
  [ActionType.READ]: ['record.read'],
  [ActionType.CREATE]: ['record.create'],
  [ActionType.NOTIFY]: ['record.notify'],
  [ActionType.DECLARE]: ['record.declare', 'record.register'],
  [ActionType.EDIT]: ['record.edit'],
  [ActionType.DELETE]: ['record.declare', 'record.notify'],
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

export function hasAnyOfScopes(a: string[], b: string[]) {
  return intersection(a, b).length > 0
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
 * @param {EncodedScope[]} scopes - The raw encoded scope strings the user possesses (from JWT).
 * @param {DisplayableAction} action - The action to check authorization for.
 * @param {EventIndexWithAdministrativeHierarchy} event - The event with resolved administrative hierarchy.
 * @param {UserContext} currentUser - The current user's context used for V2 scope validation.
 * @returns {boolean} True if the action is in scope for the user, otherwise false.
 */
export function isActionInScope({
  scopes,
  action,
  event,
  currentUser
}: {
  scopes: EncodedScope[]
  action: DisplayableAction
  event: EventIndexWithAdministrativeHierarchy
  currentUser: UserContext
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

  const acceptedScopes = isUnassigningOthers
    ? ['record.unassign-others' as const]
    : ACTION_SCOPE_MAP[action]

  // 'null' means that the action is always allowed
  if (acceptedScopes === null) {
    return true
  }

  // Empty array means that the action is never allowed
  if (!acceptedScopes.length) {
    return false
  }

  const matchingScopes = getAcceptedScopesByType({
    acceptedScopes,
    scopes
  })

  const canAccess = userCanAccessEventWithScopes(
    event,
    matchingScopes as RecordScopeV2[],
    {
      id: currentUser.id,
      primaryOfficeId: currentUser.primaryOfficeId,
      administrativeAreaId: currentUser.administrativeAreaId ?? null,
      role: currentUser.role,
      signature: currentUser.signature,
      type: currentUser.type
    }
  )

  return canAccess
}

/**
 *
 *
 * @param allRoles - All possible roles in the system
 * @param userLocation - The location and role information of the user whose role options are being determined
 * @param acceptedScopes - The scopes of the user requesting the role update, used to determine which roles they can assign.
 * @param userRequesting - The user context of the user requesting the role update, used to check location-based access to the target user's location.
 *
 * @returns An array of roles that the requesting user is allowed to assign to the target user based on their scopes and location
 *
 * 1) Used to determine which roles should be available in the dropdown when a user is editing another user's role in the user management interface.
 * 2) Used to check if payload includes valid role.
 */
export function getAvailableRolesForUserUpdatePayload({
  allRoles,
  userLocation,
  acceptedScopes,
  userRequesting
}: {
  allRoles: string[]
  userRequesting: UserContext
  acceptedScopes: UserScopeV2[]
  userLocation: {
    role?: string
    administrativeHierarchy: UUID[]
    primaryOfficeId: UUID
  }
}) {
  const availableRoles = allRoles.filter((role) => {
    const canAccess = canAccessOtherUserWithScopes({
      userToAccess: {
        ...userLocation,
        role
      },
      user: userRequesting,
      scopes: acceptedScopes
    })

    return canAccess
  })

  return availableRoles
}
