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

import * as z from 'zod/v4'
import {
  getScopes,
  AnyScope,
  decodeScope,
  ResolvedRecordScopeV2,
  UserFilter,
  JurisdictionFilter
} from '@opencrvs/commons'
import { EventIndexWithLocationHierarchy } from '../../../service/indexing/utils'
import { UserContext } from '../../../context'

/**
 * Given indexed event and resolved scope, determine if the scope allows access to the event.
 */
function canAccessEventWithScope(
  event: Partial<EventIndexWithLocationHierarchy>,
  scope: ResolvedRecordScopeV2,
  user: UserContext
): boolean {
  const opts = scope.options

  if (opts.event) {
    if (!event.type || !opts.event.includes(event.type)) {
      return false
    }
  }

  if (opts.declaredBy === UserFilter.enum.user) {
    if (event.legalStatuses?.DECLARED?.createdBy !== user.id) {
      return false
    }
  }

  if (opts.registeredBy === UserFilter.enum.user) {
    if (event.legalStatuses?.REGISTERED?.createdBy !== user.id) {
      return false
    }
  }

  if (opts.declaredIn === JurisdictionFilter.enum.location) {
    const locs = event.legalStatuses?.DECLARED?.createdAtLocation
    if (!locs || !locs.includes(user.primaryOfficeId)) {
      return false
    }
  }

  if (opts.declaredIn === JurisdictionFilter.enum.administrativeArea) {
    const locationIds = event.legalStatuses?.DECLARED?.createdAtLocation
    if (
      !locationIds ||
      !locationIds.some((id) => id === user.administrativeAreaId)
    ) {
      return false
    }
  }

  if (opts.registeredIn === JurisdictionFilter.enum.location) {
    const locationIds = event.legalStatuses?.REGISTERED?.createdAtLocation
    if (!locationIds || !locationIds.includes(user.primaryOfficeId)) {
      return false
    }
  }

  if (opts.registeredIn === JurisdictionFilter.enum.administrativeArea) {
    const locationIds = event.legalStatuses?.REGISTERED?.createdAtLocation
    if (
      !locationIds ||
      !locationIds.some((id) => id === user.administrativeAreaId)
    ) {
      return false
    }
  }

  return true
}

/**
 * Given indexed event and list of resolved scopes, determine if any of the scopes allow access to the event.
 */
export function canAccessEventWithScopes(
  event: Partial<EventIndexWithLocationHierarchy>,
  scopes: ResolvedRecordScopeV2[],
  user: UserContext
) {
  return scopes.some((scope) => canAccessEventWithScope(event, scope, user))
}

export function getAcceptedScopesFromToken(
  token: string,
  acceptedScopes: string[]
) {
  const tokenScopes = getScopes(token)

  return tokenScopes
    .map((scope) => {
      const parsedScope = decodeScope(scope)
      return parsedScope && acceptedScopes.includes(parsedScope.type)
        ? parsedScope
        : null
    })
    .filter((scope): scope is z.infer<typeof AnyScope> => scope !== null)
}
