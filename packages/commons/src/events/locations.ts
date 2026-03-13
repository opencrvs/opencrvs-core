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

import { UUID } from '../uuid'
import * as z from 'zod/v4'
import { EventIndex } from './EventIndex'
import {
  ActionCreationMetadata,
  RegistrationCreationMetadata
} from './EventMetadata'
import {
  JurisdictionFilter,
  RecordScopeV2,
  scopeUsesDeclaredOptions,
  scopeUsesFullOptions,
  UserFilter,
  isCustomActionScope
} from '../scopes-v2'
import { SystemContext, UserContext } from '../users/User'

/** @deprecated */
export const LocationTypeV1 = z.enum([
  'ADMIN_STRUCTURE',
  'CRVS_OFFICE',
  'HEALTH_FACILITY'
])
export type LocationTypeV1 = z.infer<typeof LocationTypeV1>

export const LocationType = z.enum(['CRVS_OFFICE', 'HEALTH_FACILITY'])

export type LocationType = z.infer<typeof LocationType>

export const AdministrativeArea = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  parentId: UUID.nullable(),
  validUntil: z.iso.datetime().nullable()
})

export type AdministrativeArea = z.infer<typeof AdministrativeArea>

export const Location = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  administrativeAreaId: UUID.nullable(),
  validUntil: z.iso.datetime().nullable(),
  locationType: z.string().nullable()
})

export type Location = z.infer<typeof Location>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WrapArrayPreserveNullish<V> = V extends readonly any[]
  ? V
  : NonNullable<V>[] | Extract<V, null | undefined>

/**
 * For type T, convert fields K to arrays. If field is string, convert to string[].
 */
type ToArrayFields<T, K extends PropertyKey> = T extends unknown
  ? T extends object
    ? { [P in keyof T]: P extends K ? WrapArrayPreserveNullish<T[P]> : T[P] }
    : T
  : never

/**
 * Event index type where all location fields are arrays representing full location hierarchy.
 */
export type EventIndexWithAdministrativeHierarchy = Omit<
  ToArrayFields<
    EventIndex,
    'createdAtLocation' | 'updatedAtLocation' | 'placeOfEvent'
  >,
  'legalStatuses'
> & {
  legalStatuses: {
    DECLARED:
      | ToArrayFields<ActionCreationMetadata, 'createdAtLocation'>
      | undefined
    REGISTERED:
      | ToArrayFields<RegistrationCreationMetadata, 'createdAtLocation'>
      | undefined
  }
}

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
    return (
      user.administrativeAreaId === null ||
      locationIds.some((id) => id === user.administrativeAreaId)
    )
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
  user: UserContext | SystemContext,
  customActionType?: string
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

  if (scopeUsesDeclaredOptions(scope)) {
    const { options } = scope

    if (options?.declaredBy === UserFilter.enum.user) {
      if (event.legalStatuses?.DECLARED?.createdBy !== user.id) {
        return false
      }
    }

    if (
      options?.declaredIn === JurisdictionFilter.enum.location &&
      !matchesJurisdictionFilter(
        event.legalStatuses?.DECLARED?.createdAtLocation,
        JurisdictionFilter.enum.location,
        user
      )
    ) {
      return false
    }

    if (
      options?.declaredIn === JurisdictionFilter.enum.administrativeArea &&
      !matchesJurisdictionFilter(
        event.legalStatuses?.DECLARED?.createdAtLocation,
        JurisdictionFilter.enum.administrativeArea,
        user
      )
    ) {
      return false
    }
  }

  if (scopeUsesFullOptions(scope)) {
    const { options } = scope

    if (options?.registeredBy === UserFilter.enum.user) {
      if (event.legalStatuses?.REGISTERED?.createdBy !== user.id) {
        return false
      }
    }

    if (
      options?.registeredIn === JurisdictionFilter.enum.location &&
      !matchesJurisdictionFilter(
        event.legalStatuses?.REGISTERED?.createdAtLocation,
        JurisdictionFilter.enum.location,
        user
      )
    ) {
      return false
    }

    if (
      options?.registeredIn === JurisdictionFilter.enum.administrativeArea &&
      !matchesJurisdictionFilter(
        event.legalStatuses?.REGISTERED?.createdAtLocation,
        JurisdictionFilter.enum.administrativeArea,
        user
      )
    ) {
      return false
    }
  }

  if (isCustomActionScope(scope)) {
    const { options } = scope

    if (
      !customActionType ||
      !options?.customActionTypes ||
      !options?.customActionTypes.includes(customActionType)
    ) {
      return false
    }
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
  user: UserContext | SystemContext,
  customActionType?: string
) {
  return scopes.some((scope) =>
    canAccessEventWithScope(event, scope, user, customActionType)
  )
}
