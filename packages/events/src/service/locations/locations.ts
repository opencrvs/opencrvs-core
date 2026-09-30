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

import { TRPCError } from '@trpc/server'
import {
  CreateLocationPayload,
  getUUID,
  hasActiveExternalIdOnOrAfter,
  Location,
  LocationStatus,
  LocationVersion,
  SetLocationPayload,
  UpdateLocationPayload,
  UUID,
  WithdrawLocationVersionPayload
} from '@opencrvs/commons'
import * as locationsRepo from '@events/storage/postgres/administrative-hierarchy/locations'
import * as administrativeAreasRepo from '@events/storage/postgres/administrative-hierarchy/administrative-areas'
import { isUniqueViolation } from '@events/storage/postgres/unique-violation'

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */
export async function setLocations(locations: SetLocationPayload[]) {
  await locationsRepo.setLocations(
    locations.map(
      ({
        id,
        name,
        administrativeAreaId,
        locationType,
        externalId,
        versions
      }) => ({
        id,
        name,
        administrativeAreaId,
        locationType,
        externalId,
        versions
      })
    )
  )
}

/**
 * NOTE: Be cautious when calling this function as it fetches all locations from the database.
 * Do you really need all of them? Consider using more specific functions if possible. Act as if there could be hundreds of thousands of locations.
 *
 */
export async function getLocations(params?: {
  locationType?: string
  locationIds?: UUID[]
  isActive?: boolean
  externalId?: string
}) {
  const locations = await locationsRepo.getLocations(params)

  return locations
}

export async function getLocationById(locationId: UUID) {
  const location = await locationsRepo.getLocationById(locationId)

  if (!location) {
    throw new Error(`Location with id ${locationId} not found`)
  }

  return location
}

export const getLocationHierarchy = async (locationId: UUID) => {
  return locationsRepo.getAdministrativeHierarchyById(locationId)
}

/**
 * Creates a new location with a single initial version.
 *
 * Idempotency: when the caller supplies an `id` that already exists with the
 * same identity fields and initial version, the existing location is returned
 * without inserting (`created: false`). An existing id with different values,
 * or an `externalId` already carried by a currently active location, is a
 * conflict.
 */
export async function createLocation(
  payload: CreateLocationPayload
): Promise<{ location: Location; created: boolean }> {
  const resolved = {
    id: payload.id ?? getUUID(),
    versionId: payload.versionId ?? getUUID(),
    name: payload.name,
    externalId: payload.externalId ?? null,
    administrativeAreaId: payload.administrativeAreaId,
    locationType: payload.locationType,
    effectiveFrom: payload.effectiveFrom ?? '0001-01-01',
    status: payload.status
  }

  if (payload.id) {
    const existing = await locationsRepo.getLocationRowById(payload.id)

    if (existing) {
      const [initialVersion] = existing.versions
      // name and externalId are compared against the initial version, never
      // the legacy flat columns: create leaves external_id NULL, and a seeded
      // row's flat name holds the version in effect today, which is not the
      // initial version's name once the row carries a multi-element history.
      const matchesPayload =
        initialVersion.name === resolved.name &&
        (initialVersion.externalId ?? null) === resolved.externalId &&
        existing.administrativeAreaId === resolved.administrativeAreaId &&
        existing.locationType === resolved.locationType &&
        initialVersion.effectiveFrom === resolved.effectiveFrom &&
        initialVersion.status === resolved.status

      if (matchesPayload) {
        return { location: await getLocationById(payload.id), created: false }
      }

      throw new TRPCError({
        code: 'CONFLICT',
        message: `Location with id ${payload.id} already exists with different values`
      })
    }
  }

  if (resolved.externalId !== null) {
    const externalId = resolved.externalId
    const candidates =
      await locationsRepo.getLocationsEverHoldingExternalId(externalId)

    // The new location holds the code from `effectiveFrom` onward, so it
    // collides with any location that is (or is scheduled to be) active with
    // the code at that date or later — not just with holders active today.
    const collides = candidates.some(({ versions }) =>
      hasActiveExternalIdOnOrAfter(versions, externalId, resolved.effectiveFrom)
    )

    if (collides) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `An active location with externalId ${externalId} already exists`
      })
    }
  }

  try {
    await locationsRepo.createLocation(resolved)
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A location with the same id already exists'
      })
    }
    throw error
  }

  return { location: await getLocationById(resolved.id), created: true }
}

/**
 * A request collided with an existing version that has the same
 * `effectiveFrom`. Is that version the result of this same request being
 * sent before (a retry)?
 *
 * True when it sits right after the `lastVersionId` element and carries the
 * request's values — retries are answered with success, without writing.
 * False otherwise, e.g. when the request only mimics an old version — that
 * is a conflict, not a retry.
 */
function isRetriedAppend(
  versions: LocationVersion[],
  collision: LocationVersion,
  newVersion: LocationVersion,
  lastVersionId: string
): boolean {
  const tokenIndex = versions.findIndex(
    (version) => version.versionId === lastVersionId
  )

  return (
    tokenIndex >= 0 &&
    versions[tokenIndex + 1] === collision &&
    collision.name === newVersion.name &&
    (collision.externalId ?? null) === newVersion.externalId &&
    collision.status === newVersion.status
  )
}

/**
 * Outcome of a checked version append, consumed by the router audit log.
 * Discriminated on `appended`: the version elements for the audit diff exist
 * exactly when something was written.
 */
export type VersionAppendOutcome =
  | {
      appended: true
      previousVersion: LocationVersion
      newVersion: LocationVersion
    }
  | { appended: false }

/** The complete new element: payload snapshot + server-resolved defaults. */
function resolveNewVersion(payload: UpdateLocationPayload): LocationVersion {
  return {
    versionId: payload.versionId ?? getUUID(),
    effectiveFrom:
      payload.effectiveFrom ?? new Date().toISOString().slice(0, 10),
    name: payload.name,
    externalId: payload.externalId ?? null,
    status: payload.status
  }
}

/** Fetches the entity's versions; NOT_FOUND for missing or soft-deleted rows. */
async function getExistingVersions(
  table: 'locations' | 'administrativeAreas',
  id: UUID,
  entityLabel: string
): Promise<LocationVersion[]> {
  const row = await locationsRepo.getVersionedRowById(table, id)

  if (!row || row.deletedAt !== null) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${entityLabel} with id ${id} not found`
    })
  }

  return row.versions
}

/**
 * Handles an `effectiveFrom` matching an existing element: returns true for
 * the caller's own retried append (idempotent replay — nothing to write),
 * throws CONFLICT for any other collision, returns false when no element
 * collides.
 */
function checkEffectiveFromCollision(
  versions: LocationVersion[],
  newVersion: LocationVersion,
  lastVersionId: string
): boolean {
  const collision = versions.find(
    (version) => version.effectiveFrom === newVersion.effectiveFrom
  )

  if (!collision) {
    return false
  }

  if (isRetriedAppend(versions, collision, newVersion, lastVersionId)) {
    return true
  }

  throw new TRPCError({
    code: 'CONFLICT',
    message: `A version with effectiveFrom ${newVersion.effectiveFrom} already exists`
  })
}

/**
 * A caller-supplied `versionId` must not already name an existing element —
 * elements are targeted by `versionId` (e.g. by withdraw), so duplicates
 * would make those references ambiguous.
 */
function assertVersionIdUnused(
  versions: LocationVersion[],
  newVersion: LocationVersion
): void {
  if (versions.some((v) => v.versionId === newVersion.versionId)) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `A version with versionId ${newVersion.versionId} already exists`
    })
  }
}

/** The optimistic-concurrency check: the caller must have seen the latest version. */
function assertLatestVersionToken(
  last: LocationVersion,
  lastVersionId: string,
  entityLabel: string
): void {
  if (lastVersionId !== last.versionId) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `${entityLabel} was modified by another request — refresh and retry`
    })
  }
}

/** Updates only append: no splicing new versions into the past. */
function assertForwardOnly(
  newVersion: LocationVersion,
  last: LocationVersion
): void {
  if (newVersion.effectiveFrom <= last.effectiveFrom) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message: `effectiveFrom ${newVersion.effectiveFrom} must be later than the latest version's effectiveFrom ${last.effectiveFrom}`
    })
  }
}

/**
 * On a recode (`externalId` change), CONFLICT when another entity is — or is
 * scheduled to be — active with the code on or after the new `effectiveFrom`.
 */
async function assertExternalIdAvailable({
  table,
  selfId,
  newVersion,
  last,
  entityLabel
}: {
  table: 'locations' | 'administrativeAreas'
  selfId: UUID
  newVersion: LocationVersion
  last: LocationVersion
  entityLabel: string
}): Promise<void> {
  const externalId = newVersion.externalId ?? null

  if (externalId === null || externalId === (last.externalId ?? null)) {
    return
  }

  const candidates =
    table === 'locations'
      ? await locationsRepo.getLocationsEverHoldingExternalId(externalId)
      : await administrativeAreasRepo.getAdministrativeAreasEverHoldingExternalId(
          externalId
        )

  const collides = candidates.some(
    (candidate) =>
      candidate.id !== selfId &&
      hasActiveExternalIdOnOrAfter(
        candidate.versions,
        externalId,
        newVersion.effectiveFrom
      )
  )

  if (collides) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `An active ${entityLabel.toLowerCase()} with externalId ${externalId} already exists`
    })
  }
}

/**
 * Shared update core for locations and administrative areas (the payloads are
 * structurally identical). Appends a new version element after running the
 * invariant checks — a plain read → check → append, deliberately without
 * locking: location writes are rare, single-admin operations.
 *
 * 1. missing / soft-deleted row → NOT_FOUND
 * 2. an element colliding on `effectiveFrom` → idempotent replay when it is
 *    the caller's own retried append (no write); otherwise → CONFLICT.
 *    This runs before the stale-token check because a replayed request's
 *    `lastVersionId` is legitimately stale.
 * 3. `lastVersionId` not the latest element → CONFLICT (stale token)
 * 4. `effectiveFrom` not strictly after the latest element →
 *    UNPROCESSABLE_CONTENT (updates only append, no past splices)
 * 5. a recode (`externalId` change) colliding with another entity actively
 *    holding the code on or after `effectiveFrom` → CONFLICT
 */
export async function appendVersionChecked({
  payload,
  entityLabel,
  table
}: {
  payload: UpdateLocationPayload
  entityLabel: 'Location' | 'Administrative area'
  table: 'locations' | 'administrativeAreas'
}): Promise<VersionAppendOutcome> {
  const newVersion = resolveNewVersion(payload)
  const versions = await getExistingVersions(table, payload.id, entityLabel)
  const last = versions[versions.length - 1]

  const replayed = checkEffectiveFromCollision(
    versions,
    newVersion,
    payload.lastVersionId
  )
  if (replayed) {
    return { appended: false }
  }

  assertVersionIdUnused(versions, newVersion)
  assertLatestVersionToken(last, payload.lastVersionId, entityLabel)
  assertForwardOnly(newVersion, last)
  await assertExternalIdAvailable({
    table,
    selfId: payload.id,
    newVersion,
    last,
    entityLabel
  })

  await locationsRepo.appendVersion(table, payload.id, newVersion)

  return { appended: true, previousVersion: last, newVersion }
}

/** The audit diff between two version elements — only fields that changed. */
export interface LocationVersionDiff {
  name?: { from: string; to: string }
  externalId?: { from: string | null; to: string | null }
  status?: { from: LocationStatus; to: LocationStatus }
}

export function diffLocationVersions(
  previous: LocationVersion,
  next: LocationVersion
): LocationVersionDiff {
  const diff: LocationVersionDiff = {}

  if (previous.name !== next.name) {
    diff.name = { from: previous.name, to: next.name }
  }

  const previousExternalId = previous.externalId ?? null
  const nextExternalId = next.externalId ?? null

  if (previousExternalId !== nextExternalId) {
    diff.externalId = { from: previousExternalId, to: nextExternalId }
  }

  if (previous.status !== next.status) {
    diff.status = { from: previous.status, to: next.status }
  }

  return diff
}

/**
 * Appends a new version to a location after the checks documented on
 * {@link appendVersionChecked}. Returns the location via the normal read path
 * plus the previous/new version elements for the router's audit diff.
 */
export async function updateLocation(
  payload: UpdateLocationPayload
): Promise<{ location: Location; outcome: VersionAppendOutcome }> {
  const outcome = await appendVersionChecked({
    payload,
    entityLabel: 'Location',
    table: 'locations'
  })

  return { location: await getLocationById(payload.id), outcome }
}

/** The version element that was withdrawn, for the router's audit entry. */
export interface WithdrawnVersion {
  withdrawnVersion: LocationVersion
}

/**
 * Withdraws a pending (future-dated) version element by `versionId`.
 *
 * - unknown id, or no element with that `versionId` → NOT_FOUND
 * - it is the only version the row has → CONFLICT (a row must always keep
 *   at least one version; the `versions` column is non-empty by DB
 *   constraint, so removing the last element would otherwise fail as an
 *   unhandled NOT NULL violation instead of a clean API error)
 * - the element's `effectiveFrom` is today or in the past (no longer
 *   pending — it may already be in effect) → CONFLICT
 */
export async function withdrawVersionChecked({
  payload,
  entityLabel,
  table
}: {
  payload: WithdrawLocationVersionPayload
  entityLabel: 'Location' | 'Administrative area'
  table: 'locations' | 'administrativeAreas'
}): Promise<WithdrawnVersion> {
  const versions = await getExistingVersions(table, payload.id, entityLabel)

  const target = versions.find((v) => v.versionId === payload.versionId)

  if (!target) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${entityLabel} with id ${payload.id} has no version ${payload.versionId}`
    })
  }

  if (versions.length === 1) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `${entityLabel} with id ${payload.id} has only one version — withdrawing it would leave none`
    })
  }

  const today = new Date().toISOString().slice(0, 10)

  if (target.effectiveFrom <= today) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `Version ${payload.versionId} is already in effect and can no longer be withdrawn`
    })
  }

  await locationsRepo.removeVersion(table, payload.id, payload.versionId)

  return { withdrawnVersion: target }
}

/**
 * Withdraws a pending version from a location after the checks documented on
 * {@link withdrawVersionChecked}.
 */
export async function withdrawLocationVersion(
  payload: WithdrawLocationVersionPayload
): Promise<{
  location: Location
  withdrawnVersion: WithdrawnVersion['withdrawnVersion']
}> {
  const { withdrawnVersion } = await withdrawVersionChecked({
    payload,
    entityLabel: 'Location',
    table: 'locations'
  })

  return { location: await getLocationById(payload.id), withdrawnVersion }
}
