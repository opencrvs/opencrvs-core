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
  UUID
} from '@opencrvs/commons'
import * as locationsRepo from '@events/storage/postgres/administrative-hierarchy/locations'
import * as administrativeAreasRepo from '@events/storage/postgres/administrative-hierarchy/administrative-areas'

/**
 * Narrows an unknown error to a postgres unique-violation (SQLSTATE 23505).
 * Kysely rethrows the raw `pg` DatabaseError, which carries the SQLSTATE in
 * its `code` property.
 */
export function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === '23505'
  )
}

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */
export async function setLocations(locations: SetLocationPayload[]) {
  await locationsRepo.setLocations(
    locations.map(
      ({ id, name, administrativeAreaId, locationType, externalId }) => ({
        id,
        name,
        administrativeAreaId,
        locationType,
        externalId
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
      // externalId is compared against the initial version, not the legacy
      // column — create deliberately leaves the column NULL.
      const matchesPayload =
        existing.name === resolved.name &&
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

/** Outcome of a checked version append, consumed by the router audit log. */
export interface VersionAppendOutcome {
  appended: boolean
  previousVersion?: LocationVersion
  newVersion?: LocationVersion
}

/**
 * Shared update core for locations and administrative areas (the payloads are
 * structurally identical). Appends a new version element after running the
 * invariant checks — a plain read → check → append, deliberately without
 * locking: location writes are rare, single-admin operations.
 *
 * 1. missing / soft-deleted row → NOT_FOUND
 * 2. an element with the same `effectiveFrom` and identical values →
 *    idempotent replay (no write); with different values → CONFLICT.
 *    This runs before the stale-token check because a replayed request's
 *    `lastVersionId` is legitimately stale.
 * 3. `lastVersionId` not the latest element → CONFLICT (stale token)
 * 4. `effectiveFrom` not strictly after the latest element →
 *    UNPROCESSABLE_CONTENT (history is append-only, no past splices)
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
  const newVersion: LocationVersion = {
    versionId: payload.versionId ?? getUUID(),
    effectiveFrom:
      payload.effectiveFrom ?? new Date().toISOString().slice(0, 10),
    name: payload.name,
    externalId: payload.externalId ?? null,
    status: payload.status
  }

  const row = await locationsRepo.getVersionedRowById(table, payload.id)

  if (!row || row.deletedAt !== null) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${entityLabel} with id ${payload.id} not found`
    })
  }

  const { versions } = row
  const last = versions[versions.length - 1]

  const collision = versions.find(
    (version) => version.effectiveFrom === newVersion.effectiveFrom
  )

  if (collision) {
    const isReplay =
      collision.name === newVersion.name &&
      (collision.externalId ?? null) === newVersion.externalId &&
      collision.status === newVersion.status

    if (isReplay) {
      return { appended: false }
    }

    throw new TRPCError({
      code: 'CONFLICT',
      message: `A version with effectiveFrom ${newVersion.effectiveFrom} already exists with different values`
    })
  }

  if (payload.lastVersionId !== last.versionId) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: `${entityLabel} was modified by another request — refresh and retry`
    })
  }

  if (newVersion.effectiveFrom <= last.effectiveFrom) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message: `effectiveFrom ${newVersion.effectiveFrom} must be later than the latest version's effectiveFrom ${last.effectiveFrom}`
    })
  }

  const externalId = newVersion.externalId ?? null

  if (externalId !== null && externalId !== (last.externalId ?? null)) {
    const candidates =
      table === 'locations'
        ? await locationsRepo.getLocationsEverHoldingExternalId(externalId)
        : await administrativeAreasRepo.getAdministrativeAreasEverHoldingExternalId(
            externalId
          )

    const collides = candidates.some(
      (candidate) =>
        candidate.id !== payload.id &&
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
): Promise<{ location: Location } & VersionAppendOutcome> {
  const outcome = await appendVersionChecked({
    payload,
    entityLabel: 'Location',
    table: 'locations'
  })

  return { location: await getLocationById(payload.id), ...outcome }
}
