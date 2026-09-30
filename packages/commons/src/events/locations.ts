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

/* eslint-disable max-lines -- location schemas, anchored version resolution and scope-access logic are cohesive; splitting them would create an import cycle (ClientLocation derives from Location) or fan the access helpers' 30+ importers across modules. */

import { UUID } from '../uuid'
import * as z from 'zod/v4'
import { PlainDate } from './PlainDate'
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
  isCustomActionScope,
  scopeUsesPrintCertifiedCopiesOptions,
  UserScopeV2,
  scopeUsesRoleOptions
} from '../scopes'
import { SystemContext, UserContext } from '../users/User'
import { ContainsFlags, Flag } from './Flag'

/** @deprecated Moving on, location types are arbitrary and defined by the country config. */
export const LocationTypeV1 = z.enum([
  'ADMIN_STRUCTURE',
  'CRVS_OFFICE',
  'HEALTH_FACILITY'
])
export type LocationTypeV1 = z.infer<typeof LocationTypeV1>

export const LocationStatus = z.enum(['active', 'inactive'])
export type LocationStatus = z.infer<typeof LocationStatus>

/** Thrown when a user's assigned office is inactive and must not be allowed to authenticate. */
export class InactiveOfficeError extends Error {
  constructor(message = 'Assigned office is inactive') {
    super(message)
    this.name = 'InactiveOfficeError'
  }
}

/**
 * A single element of the `versions` history of a location or administrative
 * area. Versions are sorted ascending by `effectiveFrom` ('0001-01-01' is used
 * as the beginning-of-time sentinel). Updates only ever append, but a
 * not-yet-effective version can be withdrawn and seeding replaces a history
 * wholesale, so the array is not append-only.
 */
export const LocationVersion = z.object({
  versionId: UUID,
  effectiveFrom: z.iso.date(),
  name: z.string(),
  externalId: z.string().nullish(),
  status: LocationStatus
})

export type LocationVersion = z.infer<typeof LocationVersion>

export const AdministrativeArea = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  parentId: UUID.nullable(),
  status: LocationStatus,
  versions: z.array(LocationVersion)
})

export type AdministrativeArea = z.infer<typeof AdministrativeArea>

export const Location = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  administrativeAreaId: UUID.nullable(),
  locationType: z.string().nullable(),
  status: LocationStatus,
  versions: z.array(LocationVersion)
})

export type Location = z.infer<typeof Location>

/**
 * TEMPORARY — client-side view of {@link AdministrativeArea} with the
 * server-flattened `name`, `status` and `externalId` removed, leaving exactly
 * identity + versions. Every name/status read is thereby forced through the
 * anchored resolution utilities ({@link resolveVersion}, {@link resolvePath})
 * at compile time. Delete this type when the contract migration removes the
 * flat fields from the server schema, at which point the wire type itself
 * becomes identity + versions.
 */
export const ClientAdministrativeArea = AdministrativeArea.omit({
  name: true,
  status: true,
  externalId: true
})

export type ClientAdministrativeArea = z.infer<typeof ClientAdministrativeArea>

/**
 * TEMPORARY — client-side view of {@link Location} with the server-flattened
 * `name`, `status` and `externalId` removed, leaving exactly identity +
 * versions. See {@link ClientAdministrativeArea} for the full rationale and
 * deletion condition.
 */
export const ClientLocation = Location.omit({
  name: true,
  status: true,
  externalId: true
})

export type ClientLocation = z.infer<typeof ClientLocation>

/**
 * Strips the server-flattened fields from a location as it enters the
 * client's cached maps. The wire format keeps the flat fields for
 * compatibility; the cache must not, or devices would keep rendering names
 * flattened before a future-dated version takes effect.
 */
export function toClientLocation(location: Location): ClientLocation {
  return {
    id: location.id,
    administrativeAreaId: location.administrativeAreaId,
    locationType: location.locationType,
    versions: location.versions
  }
}

/** See {@link toClientLocation}. */
export function toClientAdministrativeArea(
  area: AdministrativeArea
): ClientAdministrativeArea {
  return {
    id: area.id,
    parentId: area.parentId,
    versions: area.versions
  }
}

function validateAscendingDates(
  versions: LocationVersion[],
  ctx: z.core.$RefinementCtx<LocationVersion[]>
) {
  const ascending = versions.every(
    (version, index) =>
      index === 0 || versions[index - 1].effectiveFrom < version.effectiveFrom
  )

  if (!ascending) {
    ctx.addIssue('versions must be strictly ascending by effectiveFrom')
  }
}

function validateUniqueIds(
  versions: LocationVersion[],
  ctx: z.core.$RefinementCtx<LocationVersion[]>
) {
  const versionIds = new Set(versions.map((version) => version.versionId))

  if (versionIds.size !== versions.length) {
    ctx.addIssue('versions must not repeat a versionId')
  }
}

export const SeededLocationVersions = z
  .array(LocationVersion)
  .min(1)
  .superRefine((versions, ctx) => {
    validateAscendingDates(versions, ctx)
    validateUniqueIds(versions, ctx)
  })

export type SeededLocationVersions = z.infer<typeof SeededLocationVersions>

/**
 * Input payload for the locations `set` mutation. Carries the seedable
 * identity and hierarchy fields, plus an optional pre-built history.
 *
 * Last-write-wins on history: a repeated seed of the same row replaces its
 * stored `versions`, so a caller that means to keep one has to send it every
 * time. Seeding is only reachable while system initialisation is incomplete,
 * so this replaces what an earlier seed attempt wrote, never a live history.
 */
export const SetLocationPayload = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  administrativeAreaId: UUID.nullable(),
  locationType: z.string().nullable(),
  versions: SeededLocationVersions.optional()
})

export type SetLocationPayload = z.infer<typeof SetLocationPayload>

/**
 * Input payload for the administrative areas `set` mutation. Twin of
 * {@link SetLocationPayload}, including the optional pre-built `versions`
 * history and the same semantics for omitting it.
 */
export const SetAdministrativeAreaPayload = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  parentId: UUID.nullable(),
  versions: SeededLocationVersions.optional()
})

export type SetAdministrativeAreaPayload = z.infer<
  typeof SetAdministrativeAreaPayload
>

/**
 * Resolves the version in effect at the given anchor date.
 *
 * Returns the element with the greatest `effectiveFrom` that is less than or
 * equal to `anchor`, falling back to the earliest element when the anchor
 * precedes all versions. Assumes `versions` is sorted ascending by
 * `effectiveFrom`. Both `effectiveFrom` and `anchor` are 'YYYY-MM-DD' strings,
 * so plain string comparison is correct.
 */
export function resolveVersion<T extends { effectiveFrom: string }>(
  versions: T[],
  anchor: string
): T {
  let resolved = versions[0]

  for (const version of versions) {
    if (version.effectiveFrom <= anchor) {
      resolved = version
    }
  }

  return resolved
}

/**
 * Whether the entity is selectable at `anchor`: it must already have a
 * version effective by then, and the version that resolves at `anchor` must
 * be active. `resolveVersion` alone is not enough for this — when `anchor`
 * precedes every version it falls back to the earliest one, which would
 * otherwise make a location created after `anchor` look selectable.
 */
export function isSelectableAtAnchor<
  T extends { effectiveFrom: string; status: string }
>(versions: T[], anchor: string): boolean {
  return (
    versions.some((version) => version.effectiveFrom <= anchor) &&
    resolveVersion(versions, anchor).status === 'active'
  )
}

/**
 * Whether the entity holds the given externalId with active status at the
 * anchor date or at any point after it. Used for point-in-time uniqueness of
 * external codes: a new holder starting at `anchor` collides when an existing
 * holder is (or is scheduled to be) active with the code from then on.
 */
export function hasActiveExternalIdOnOrAfter(
  versions: LocationVersion[],
  externalId: string,
  anchor: string
): boolean {
  const inEffectAtAnchor = resolveVersion(versions, anchor)
  const laterVersions = versions.filter((v) => v.effectiveFrom > anchor)

  return [inEffectAtAnchor, ...laterVersions].some(
    (v) => v.externalId === externalId && v.status === 'active'
  )
}

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
    NOTIFIED:
      | ToArrayFields<ActionCreationMetadata, 'createdAtLocation'>
      | undefined
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
      !user.administrativeAreaId ||
      locationIds.some((id) => id === user.administrativeAreaId)
    )
  }

  return true
}

/**
 * Mirrors `buildFlagsQuery` (packages/events/src/service/indexing/query.ts),
 * which applies the same `anyOf`/`noneOf`/`allOf` rules to Elasticsearch
 * queries — this is the single-record equivalent used for e.g. Record tab
 * and action-button visibility checks.
 *
 * @param eventFlags flags currently present on the event index
 * @param flags flags filter from the scope
 * @returns whether the event's flags satisfy the scope's flags filter.
 */
function matchesFlagsFilter(
  eventFlags: Flag[] | null | undefined,
  flags: ContainsFlags
): boolean {
  const currentFlags = eventFlags ?? []

  if (flags.anyOf && !flags.anyOf.some((flag) => currentFlags.includes(flag))) {
    return false
  }

  if (
    flags.noneOf &&
    flags.noneOf.some((flag) => currentFlags.includes(flag))
  ) {
    return false
  }

  if (
    flags.allOf &&
    !flags.allOf.every((flag) => currentFlags.includes(flag))
  ) {
    return false
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
  event: EventIndexWithAdministrativeHierarchy,
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

  if (opts?.createdBy === UserFilter.enum.user && event.createdBy !== user.id) {
    return false
  }

  if (
    opts?.createdIn === JurisdictionFilter.enum.location &&
    !matchesJurisdictionFilter(
      event.createdAtLocation,
      JurisdictionFilter.enum.location,
      user
    )
  ) {
    return false
  }

  if (
    opts?.createdIn === JurisdictionFilter.enum.administrativeArea &&
    !matchesJurisdictionFilter(
      event.createdAtLocation,
      JurisdictionFilter.enum.administrativeArea,
      user
    )
  ) {
    return false
  }

  if (scopeUsesDeclaredOptions(scope)) {
    const { options } = scope

    if (
      options?.status &&
      (!event.status || !options.status.includes(event.status))
    ) {
      return false
    }

    if (options?.notifiedBy === UserFilter.enum.user) {
      if (event.legalStatuses?.NOTIFIED?.createdBy !== user.id) {
        return false
      }
    }

    if (
      options?.notifiedIn === JurisdictionFilter.enum.location &&
      !matchesJurisdictionFilter(
        event.legalStatuses?.NOTIFIED?.createdAtLocation,
        JurisdictionFilter.enum.location,
        user
      )
    ) {
      return false
    }

    if (
      options?.notifiedIn === JurisdictionFilter.enum.administrativeArea &&
      !matchesJurisdictionFilter(
        event.legalStatuses?.NOTIFIED?.createdAtLocation,
        JurisdictionFilter.enum.administrativeArea,
        user
      )
    ) {
      return false
    }

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

  if (
    scopeUsesFullOptions(scope) ||
    scopeUsesPrintCertifiedCopiesOptions(scope) ||
    isCustomActionScope(scope)
  ) {
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

    if (options?.flags && !matchesFlagsFilter(event.flags, options.flags)) {
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

export type UserWithResolvedHierarchy = {
  role: string
  administrativeHierarchy: UUID[]
  primaryOfficeId: UUID
}

export function canAccessUserWithScope({
  userToAccess,
  scope,
  user
}: {
  userToAccess: UserWithResolvedHierarchy
  scope: UserScopeV2
  user: UserContext | SystemContext
}): boolean {
  const opts = scope.options

  const hasSameOffice = user.primaryOfficeId === userToAccess.primaryOfficeId

  if (
    opts?.accessLevel === JurisdictionFilter.enum.location &&
    !hasSameOffice
  ) {
    return false
  }

  const hasAdministrativeAreaInHierarchy =
    userToAccess.administrativeHierarchy.some(
      (id) => user.administrativeAreaId === id
    ) || !user.administrativeAreaId // user with no administrative area has access to all administrative areas

  if (
    opts?.accessLevel === JurisdictionFilter.enum.administrativeArea &&
    !hasAdministrativeAreaInHierarchy
  ) {
    return false
  }

  if (scopeUsesRoleOptions(scope)) {
    const { options } = scope
    if (options?.role && !options.role.includes(userToAccess.role)) {
      return false
    }
  }

  return true
}

export function canAccessOtherUserWithScopes({
  scopes,
  userToAccess,
  user
}: {
  scopes: UserScopeV2[]
  userToAccess: UserWithResolvedHierarchy
  user: UserContext | SystemContext
}) {
  return scopes.some((scope) =>
    canAccessUserWithScope({ userToAccess, scope, user })
  )
}

/**
 * Given indexed event and list of resolved scopes, determine if any of the scopes allow access to the event.
 *
 * One of the scopes must allow access for the event to be accessible.
 */
export function userCanAccessEventWithScopes(
  event: EventIndexWithAdministrativeHierarchy,
  scopes: RecordScopeV2[],
  user: UserContext | SystemContext,
  customActionType?: string
) {
  return scopes.some((scope) =>
    canAccessEventWithScope(event, scope, user, customActionType)
  )
}

// Given an administrative area id, return the full hierarchy from root to leaf.
export function getAdministrativeAreaHierarchy<
  A extends { id: UUID; parentId: UUID | null }
>(
  administrativeAreaId: string | undefined | null,
  administrativeAreas: Map<UUID, A>
) {
  // Collect location objects from leaf to root
  const collectedLocations: A[] = []

  const parsedAdministrativeAreaId =
    administrativeAreaId && UUID.safeParse(administrativeAreaId).data

  let current = parsedAdministrativeAreaId
    ? administrativeAreas.get(parsedAdministrativeAreaId)
    : null

  while (current) {
    collectedLocations.push(current)
    if (!current.parentId) {
      break
    }
    const parentId = current.parentId
    current = administrativeAreas.get(parentId)
  }

  return collectedLocations
}

/**
 * Resolves a location or administrative area UUID into a root-first hierarchy of UUIDs.
 *
 * If the ID refers to a `Location` (e.g. CRVS office), the hierarchy includes
 * the administrative area ancestors followed by the location itself.
 * If the ID refers to an `AdministrativeArea`, returns the area's ancestor chain (root-first).
 *
 * Uses `getAdministrativeAreaHierarchy` which returns leaf-first order,
 * so the result is reversed to match the root-first convention used by the server.
 */
export function getLocationHierarchy(
  selectedId: UUID,
  context: {
    administrativeAreas: Map<UUID, { id: UUID; parentId: UUID | null }>
    locations: Map<UUID, { id: UUID; administrativeAreaId: UUID | null }>
  }
): UUID[] {
  const { administrativeAreas, locations } = context
  const loc = locations.get(selectedId)

  if (loc) {
    if (loc.administrativeAreaId) {
      const hierarchy = getAdministrativeAreaHierarchy(
        loc.administrativeAreaId,
        administrativeAreas
      )
      return [...hierarchy.reverse().map((area) => area.id), loc.id]
    }
    return [loc.id]
  }

  const hierarchy = getAdministrativeAreaHierarchy(
    selectedId,
    administrativeAreas
  )
  return hierarchy.reverse().map((area) => area.id)
}

/**
 * A node of an anchored hierarchy path: the identity id plus the name and
 * status in effect at the anchor date.
 */
export type ResolvedPathNode = {
  id: UUID
  name: string
  status: LocationStatus
}

/**
 * Resolves a location or administrative area id into its root-first
 * hierarchy path — leaf included — with every node's name and status
 * resolved at the anchor date.
 *
 * The parent chain is identity-level and fixed for life, so the chain is
 * constant and only each node's name/status varies with the anchor. Status is
 * returned for callers that filter on it; an inactive node still resolves to
 * its name. Returns an empty array for an unknown id.
 */
export function resolvePath(
  locationId: UUID,
  anchor: PlainDate,
  context: {
    administrativeAreas: Map<
      UUID,
      { id: UUID; parentId: UUID | null; versions: LocationVersion[] }
    >
    locations: Map<
      UUID,
      {
        id: UUID
        administrativeAreaId: UUID | null
        versions: LocationVersion[]
      }
    >
  }
): ResolvedPathNode[] {
  return getLocationHierarchy(locationId, context).flatMap((id) => {
    const node =
      context.locations.get(id) ?? context.administrativeAreas.get(id)

    if (!node) {
      return []
    }

    const { name, status } = resolveVersion(node.versions, anchor)
    return [{ id, name, status }]
  })
}
