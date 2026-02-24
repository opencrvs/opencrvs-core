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

import {
  getScopes,
  decodeScope,
  UserFilter,
  JurisdictionFilter,
  RecordScopeTypeV2,
  RecordScopeV2,
  UUID
} from '@opencrvs/commons'
import { EventIndexWithAdministrativeHierarchy } from '../../../service/indexing/utils'
import { SystemContext, UserContext } from '../../../context'

/**
 *
 * @param locationIds location hierarchy from event index
 * @param filter jurisdiction filter from the scope
 * @param user user context to resolve scopes against.
 * @returns whether the locationIds satisfy the jurisdiction filter for the user.
 */
function matchesJurisdictionFilter(
  locationIds: UUID[] | null | undefined,
  filter: JurisdictionFilter,
  user: UserContext | SystemContext
): boolean {
  if (!locationIds) {
    return false
  }

  if (filter === JurisdictionFilter.enum.location) {
    return locationIds.some((id) => id === user.primaryOfficeId)
  }
  if (filter === JurisdictionFilter.enum.administrativeArea) {
    return locationIds.some((id) => id === user.administrativeAreaId)
  }

  return true
}

/**
 * Given indexed event and resolved scope, determine if the scope allows access to the event.
 *
 * All of the options within the scope must be satisfied for access to be granted.
 * Return false early to break out of checks as soon as possible - if any option is not satisfied, the scope does not allow access to the event, so no need to check further options.
 *
 */
export function canAccessEventWithScope(
  event: Partial<EventIndexWithAdministrativeHierarchy>,
  scope: RecordScopeV2,
  user: UserContext | SystemContext
): boolean {
  const opts = scope.options

  if (opts?.event) {
    if (!event.type || !opts.event.includes(event.type)) {
      return false
    }
  }

  if (
    opts?.placeOfEvent === JurisdictionFilter.enum.location &&
    !matchesJurisdictionFilter(
      event.placeOfEvent,
      JurisdictionFilter.enum.location,
      user
    )
  ) {
    return false
  }

  if (
    opts?.placeOfEvent === JurisdictionFilter.enum.administrativeArea &&
    !matchesJurisdictionFilter(
      event.placeOfEvent,
      JurisdictionFilter.enum.administrativeArea,
      user
    )
  ) {
    return false
  }

  if (opts?.declaredBy === UserFilter.enum.user) {
    if (event.legalStatuses?.DECLARED?.createdBy !== user.id) {
      return false
    }
  }

  if (
    opts?.declaredIn === JurisdictionFilter.enum.location &&
    !matchesJurisdictionFilter(
      event.legalStatuses?.DECLARED?.createdAtLocation,
      JurisdictionFilter.enum.location,
      user
    )
  ) {
    return false
  }

  if (
    opts?.declaredIn === JurisdictionFilter.enum.administrativeArea &&
    !matchesJurisdictionFilter(
      event.legalStatuses?.DECLARED?.createdAtLocation,
      JurisdictionFilter.enum.administrativeArea,
      user
    )
  ) {
    return false
  }

  if (opts?.registeredBy === UserFilter.enum.user) {
    if (event.legalStatuses?.REGISTERED?.createdBy !== user.id) {
      return false
    }
  }

  if (
    opts?.registeredIn === JurisdictionFilter.enum.location &&
    !matchesJurisdictionFilter(
      event.legalStatuses?.REGISTERED?.createdAtLocation,
      JurisdictionFilter.enum.location,
      user
    )
  ) {
    return false
  }

  if (
    opts?.registeredIn === JurisdictionFilter.enum.administrativeArea &&
    !matchesJurisdictionFilter(
      event.legalStatuses?.REGISTERED?.createdAtLocation,
      JurisdictionFilter.enum.administrativeArea,
      user
    )
  ) {
    return false
  }

  return true
}

/**
 * Given indexed event and list of resolved scopes, determine if any of the scopes allow access to the event.
 *
 * One of the scopes must allow access for the event to be accessible.
 */
export function userCanAccessEventWithScopes(
  event: Partial<EventIndexWithAdministrativeHierarchy>,
  scopes: RecordScopeV2[],
  user: UserContext | SystemContext
) {
  return scopes.some((scope) => canAccessEventWithScope(event, scope, user))
}

export function getAcceptedScopesFromToken(
  token: string,
  acceptedScopes: RecordScopeTypeV2[]
) {
  const tokenScopes = getScopes(token)

  return tokenScopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope && acceptedScopes.includes(parsedScope.type)
        ? parsedScope
        : null
    })
    .filter((scope): scope is RecordScopeV2 => scope !== null)
}
