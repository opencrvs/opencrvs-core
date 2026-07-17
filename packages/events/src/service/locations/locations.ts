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
  SetLocationPayload,
  UUID
} from '@opencrvs/commons'
import * as locationsRepo from '@events/storage/postgres/administrative-hierarchy/locations'

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
