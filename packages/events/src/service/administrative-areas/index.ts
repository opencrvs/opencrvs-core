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
  AdministrativeArea,
  CreateAdministrativeAreaPayload,
  getUUID,
  hasActiveExternalIdOnOrAfter,
  UpdateAdministrativeAreaPayload,
  UUID,
  SetAdministrativeAreaPayload,
  WithdrawAdministrativeAreaVersionPayload
} from '@opencrvs/commons'
import * as administrativeAreaRepo from '@events/storage/postgres/administrative-hierarchy/administrative-areas'
import { clearAdministrativeHierarchyCache } from '@events/storage/postgres/administrative-hierarchy/locations'
import { isUniqueViolation } from '@events/storage/postgres/unique-violation'
import {
  appendVersionChecked,
  VersionAppendOutcome,
  withdrawVersionChecked,
  WithdrawnVersion
} from '@events/service/locations/locations'

export async function getAdministrativeAreas(params?: {
  isActive?: boolean
  ids?: UUID[]
  externalId?: string
}) {
  const administrativeAreas =
    await administrativeAreaRepo.getAdministrativeAreas(params)

  return administrativeAreas
}

async function getAdministrativeAreaById(administrativeAreaId: UUID) {
  const administrativeAreas =
    await administrativeAreaRepo.getAdministrativeAreas({
      ids: [administrativeAreaId]
    })
  const administrativeArea = administrativeAreas.at(0)

  if (!administrativeArea) {
    throw new Error(
      `Administrative area with id ${administrativeAreaId} not found`
    )
  }

  return administrativeArea
}

/**
 * Creates a new administrative area with a single initial version.
 *
 * Idempotency: when the caller supplies an `id` that already exists with the
 * same identity fields and initial version, the existing administrative area
 * is returned without inserting (`created: false`). An existing id with
 * different values, or an `externalId` already carried by a currently active
 * administrative area, is a conflict.
 */
export async function createAdministrativeArea(
  payload: CreateAdministrativeAreaPayload
): Promise<{ administrativeArea: AdministrativeArea; created: boolean }> {
  const resolved = {
    id: payload.id ?? getUUID(),
    versionId: payload.versionId ?? getUUID(),
    name: payload.name,
    externalId: payload.externalId ?? null,
    parentId: payload.parentId,
    effectiveFrom: payload.effectiveFrom ?? '0001-01-01',
    status: payload.status
  }

  if (payload.id) {
    const existing = await administrativeAreaRepo.getAdministrativeAreaRowById(
      payload.id
    )

    if (existing) {
      const [initialVersion] = existing.versions
      // name and externalId are compared against the initial version, never
      // the legacy flat columns: create leaves external_id NULL, and a seeded
      // row's flat name holds the version in effect today, which is not the
      // initial version's name once the row carries a multi-element history.
      const matchesPayload =
        initialVersion.name === resolved.name &&
        (initialVersion.externalId ?? null) === resolved.externalId &&
        existing.parentId === resolved.parentId &&
        initialVersion.effectiveFrom === resolved.effectiveFrom &&
        initialVersion.status === resolved.status

      if (matchesPayload) {
        return {
          administrativeArea: await getAdministrativeAreaById(payload.id),
          created: false
        }
      }

      throw new TRPCError({
        code: 'CONFLICT',
        message: `Administrative area with id ${payload.id} already exists with different values`
      })
    }
  }

  if (resolved.externalId !== null) {
    const externalId = resolved.externalId
    const candidates =
      await administrativeAreaRepo.getAdministrativeAreasEverHoldingExternalId(
        externalId
      )

    // The new area holds the code from `effectiveFrom` onward, so it collides
    // with any area that is (or is scheduled to be) active with the code at
    // that date or later — not just with holders active today.
    const collides = candidates.some(({ versions }) =>
      hasActiveExternalIdOnOrAfter(versions, externalId, resolved.effectiveFrom)
    )

    if (collides) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `An active administrative area with externalId ${externalId} already exists`
      })
    }
  }

  try {
    await administrativeAreaRepo.createAdministrativeArea(resolved)
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'An administrative area with the same id already exists'
      })
    }
    throw error
  }

  return {
    administrativeArea: await getAdministrativeAreaById(resolved.id),
    created: true
  }
}

/**
 * Appends a new version to an administrative area after the checks documented
 * on {@link appendVersionChecked}. Returns the area via the normal read path
 * plus the previous/new version elements for the router's audit diff.
 */
export async function updateAdministrativeArea(
  payload: UpdateAdministrativeAreaPayload
): Promise<{
  administrativeArea: AdministrativeArea
  outcome: VersionAppendOutcome
}> {
  const outcome = await appendVersionChecked({
    payload,
    entityLabel: 'Administrative area',
    table: 'administrativeAreas'
  })

  return {
    administrativeArea: await getAdministrativeAreaById(payload.id),
    outcome
  }
}

/**
 * Withdraws a pending version from an administrative area after the checks
 * documented on {@link withdrawVersionChecked}.
 */
export async function withdrawAdministrativeAreaVersion(
  payload: WithdrawAdministrativeAreaVersionPayload
): Promise<{
  administrativeArea: AdministrativeArea
  withdrawnVersion: WithdrawnVersion['withdrawnVersion']
}> {
  const { withdrawnVersion } = await withdrawVersionChecked({
    payload,
    entityLabel: 'Administrative area',
    table: 'administrativeAreas'
  })

  return {
    administrativeArea: await getAdministrativeAreaById(payload.id),
    withdrawnVersion
  }
}

export async function setAdministrativeAreas(
  administrativeAreas: SetAdministrativeAreaPayload[]
) {
  await administrativeAreaRepo.setAdministrativeAreas(administrativeAreas)
  clearAdministrativeHierarchyCache()
}
