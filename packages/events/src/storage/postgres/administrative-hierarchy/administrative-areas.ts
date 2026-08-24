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

import { chunk } from 'lodash'
import { Kysely, sql } from 'kysely'
import {
  logger,
  LocationStatus,
  SetAdministrativeAreaPayload,
  UUID
} from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import Schema from '../events/schema/Database'
import {
  buildInitialVersions,
  buildVersions,
  clearAdministrativeHierarchyCache,
  parseVersions,
  resolveVersionFields
} from './locations'

export async function getAdministrativeAreas({
  ids,
  isActive,
  externalId
}: {
  ids?: UUID[]
  isActive?: boolean
  externalId?: string
} = {}) {
  const db = getClient()

  let query = db
    .selectFrom('administrativeAreas')
    .select(['id', 'parentId', 'versions'])
    .where('deletedAt', 'is', null)

  if (externalId) {
    // Containment only narrows to rows that carried the code at some point;
    // the current-code match happens after row mapping below.
    query = query.where(
      sql<boolean>`versions @> ${JSON.stringify([{ externalId }])}::jsonb`
    )
  }

  if (ids && ids.length > 0) {
    query = query.where('id', 'in', ids)
  }

  const rows = await query.execute()

  let administrativeAreas = rows.map(({ versions: rawVersions, ...row }) => {
    const versions = parseVersions(rawVersions, row.id)
    return { ...row, versions, ...resolveVersionFields(versions) }
  })

  // externalId and active status are resolved from the versions array (the
  // version in effect today), so both filters run after row mapping rather
  // than in SQL.
  if (externalId) {
    administrativeAreas = administrativeAreas.filter(
      (area) => area.externalId === externalId
    )
  }

  if (isActive) {
    administrativeAreas = administrativeAreas.filter(
      (area) => area.status === 'active'
    )
  }

  return administrativeAreas
}

/**
 * Administrative-area twin of `getLocationsEverHoldingExternalId` — all areas
 * whose versions array carried the code at any point in their timeline.
 */
export async function getAdministrativeAreasEverHoldingExternalId(
  externalId: string
) {
  const db = getClient()

  const rows = await db
    .selectFrom('administrativeAreas')
    .select(['id', 'versions'])
    .where('deletedAt', 'is', null)
    .where(sql<boolean>`versions @> ${JSON.stringify([{ externalId }])}::jsonb`)
    .execute()

  return rows.map(({ versions: rawVersions, id }) => ({
    id,
    versions: parseVersions(rawVersions, id)
  }))
}

/** The fully resolved values of an administrative area create request. */
export interface CreateAdministrativeAreaRow {
  id: UUID
  versionId: UUID
  name: string
  externalId: string | null
  parentId: UUID | null
  effectiveFrom: string
  status: LocationStatus
}

/**
 * Inserts a single new administrative area with a one-element `versions`
 * history built from the resolved create values. Deliberately has no conflict
 * handling — id / externalId collisions must surface to the caller.
 */
export async function createAdministrativeArea(
  administrativeArea: CreateAdministrativeAreaRow
) {
  const db = getClient()

  await db
    .insertInto('administrativeAreas')
    .values({
      id: administrativeArea.id,
      name: administrativeArea.name,
      // Legacy column intentionally not populated — see createLocation.
      externalId: null,
      parentId: administrativeArea.parentId,
      deletedAt: null,
      versions: buildInitialVersions(administrativeArea)
    })
    .execute()

  clearAdministrativeHierarchyCache()
}

/**
 * Fetches an administrative area row by id without the soft-delete filter and
 * without resolving version fields. Used by the create path to detect
 * idempotent retries against any existing row, including soft-deleted ones.
 */
export async function getAdministrativeAreaRowById(administrativeAreaId: UUID) {
  const db = getClient()

  const row = await db
    .selectFrom('administrativeAreas')
    .select(['id', 'parentId', 'versions'])
    .where('id', '=', administrativeAreaId)
    .executeTakeFirst()

  if (!row) {
    return undefined
  }

  return { ...row, versions: parseVersions(row.versions, row.id) }
}

const INSERT_MAX_CHUNK_SIZE = 1000

function toAdministrativeAreaInsertValues(area: SetAdministrativeAreaPayload) {
  const base = {
    id: area.id,
    parentId: area.parentId,
    externalId: area.externalId,
    deletedAt: null
  }

  if (!area.versions) {
    return {
      ...base,
      name: area.name,
      versions: buildInitialVersions(area)
    }
  }

  return {
    ...base,
    name: resolveVersionFields(area.versions).name,
    versions: buildVersions(area.versions)
  }
}

export async function setAdministrativeAreasInTrx(
  trx: Kysely<Schema>,
  administrativeAreas: SetAdministrativeAreaPayload[]
) {
  for (const [index, batch] of chunk(
    administrativeAreas,
    INSERT_MAX_CHUNK_SIZE
  ).entries()) {
    logger.info(
      `Processing ${Math.min((index + 1) * INSERT_MAX_CHUNK_SIZE, administrativeAreas.length)}/${administrativeAreas.length} administrative areas`
    )
    await trx
      .insertInto('administrativeAreas')
      .values(batch.map(toAdministrativeAreaInsertValues))
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: () =>
            sql`CASE
             WHEN excluded.name IS NOT NULL
             THEN excluded.name
             ELSE administrative_areas.name
           END`,
          parentId: (eb) => eb.ref('excluded.parentId'),
          updatedAt: () => sql`now()`,
          externalId: () =>
            sql`CASE
             WHEN excluded.external_id IS NOT NULL
             THEN excluded.external_id
             ELSE administrative_areas.external_id
           END`,
          // A repeated seed replaces the stored history with the incoming one:
          // the supplied history when the payload carries `versions`,
          // otherwise the freshly built single element. Sound only because
          // seeding is gated to incomplete initialisation, so what gets
          // replaced is an earlier seed attempt's work, never versions added
          // through the audited update / withdraw endpoints.
          versions: (eb) => eb.ref('excluded.versions'),
          deletedAt: null
        })
      )
      .execute()
  }
}

export async function setAdministrativeAreas(
  administrativeAreas: SetAdministrativeAreaPayload[]
) {
  const db = getClient()
  await setAdministrativeAreasInTrx(db, administrativeAreas)
}
