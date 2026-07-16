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

import { Kysely, RawBuilder, sql } from 'kysely'
import { chunk } from 'lodash'
import {
  getUUID,
  LocationVersion,
  logger,
  resolveVersion,
  UUID
} from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { NewLocations } from '../events/schema/app/Locations'
import Schema from '../events/schema/Database'

// This used to be 10k but was decreased due to postgres throwing error on large location amount in data seeding:
// "bind message has ... parameter formats but 0 parameters"
const INSERT_MAX_CHUNK_SIZE = 1000

// Process-level cache for administrative hierarchies. Invalidated whenever
// locations or administrative areas are written.
const administrativeHierarchyByIdCache = new Map<string, Promise<UUID[]>>()

export function clearAdministrativeHierarchyCache() {
  administrativeHierarchyByIdCache.clear()
}

/**
 * Builds the initial `versions` jsonb value for a location or administrative
 * area row on insert. The initial version is always a single active element
 * effective from the beginning of time.
 */
export function buildInitialVersions({
  name,
  externalId
}: {
  name: string
  externalId?: string | null
}): RawBuilder<LocationVersion[]> {
  const versions: LocationVersion[] = [
    {
      versionId: getUUID(),
      effectiveFrom: '0001-01-01',
      name,
      externalId: externalId ?? null,
      status: 'active'
    }
  ]

  return sql`cast (${JSON.stringify(versions)} as jsonb)`
}

/**
 * Parses the `versions` jsonb column of a location or administrative area
 * row, attaching the row id to the error when the content does not match the
 * schema — a raw ZodError would not identify which row is corrupt.
 */
export function parseVersions(rawVersions: unknown, rowId: string) {
  try {
    return LocationVersion.array().parse(rawVersions)
  } catch (error) {
    throw new Error(
      `Invalid versions content for row ${rowId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Resolves the read model fields (`name`, `externalId`, `status`) from the
 * version in effect today (UTC).
 */
export function resolveVersionFields(versions: LocationVersion[]) {
  const today = new Date().toISOString().slice(0, 10)
  const current = resolveVersion(versions, today)

  return {
    name: current.name,
    externalId: current.externalId ?? null,
    status: current.status
  }
}

export async function setLocationsInTrx(
  trx: Kysely<Schema>,
  locations: Omit<NewLocations, 'versions' | 'validUntil'>[]
) {
  // Insert new locations in chunks to avoid exceeding max query size
  for (const [index, batch] of chunk(
    locations,
    INSERT_MAX_CHUNK_SIZE
  ).entries()) {
    logger.info(
      `Processing ${Math.min((index + 1) * INSERT_MAX_CHUNK_SIZE, locations.length)}/${locations.length} locations`
    )
    await trx
      .insertInto('locations')
      .values(
        batch.map((loc) => ({
          ...loc,
          deletedAt: null,
          versions: buildInitialVersions(loc)
        }))
      )
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          name: () =>
            sql`CASE
             WHEN excluded.name IS NOT NULL
             THEN excluded.name
             ELSE locations.name
           END`,
          administrativeAreaId: (eb) => eb.ref('excluded.administrativeAreaId'),
          locationType: (eb) => eb.ref('excluded.locationType'),
          updatedAt: () => sql`now()`,
          externalId: () =>
            sql`CASE
             WHEN excluded.external_id IS NOT NULL
             THEN excluded.external_id
             ELSE locations.external_id
           END`,
          deletedAt: null
        })
      )
      .execute()
  }
}

export async function setLocations(
  locations: Omit<NewLocations, 'versions' | 'validUntil'>[]
) {
  const db = getClient()

  await setLocationsInTrx(db, locations)
  clearAdministrativeHierarchyCache()
}

export async function getLocations({
  locationType,
  locationIds,
  isActive,
  externalId
}: {
  locationType?: string
  locationIds?: UUID[]
  isActive?: boolean
  externalId?: string
} = {}) {
  const db = getClient()

  let query = db
    .selectFrom('locations')
    .select(['id', 'locationType', 'administrativeAreaId', 'versions'])
    .where('deletedAt', 'is', null)

  if (locationType) {
    query = query.where('locationType', '=', locationType)
  }

  if (externalId) {
    query = query.where('externalId', '=', externalId)
  }

  if (locationIds && locationIds.length > 0) {
    query = query.where('id', 'in', locationIds)
  }

  const rows = await query.execute()

  const locations = rows.map(({ versions: rawVersions, ...row }) => {
    const versions = parseVersions(rawVersions, row.id)
    return { ...row, versions, ...resolveVersionFields(versions) }
  })

  // Active status is resolved from the versions array (the version in effect
  // today), so the filter runs after row mapping rather than in SQL.
  if (isActive) {
    return locations.filter((location) => location.status === 'active')
  }

  return locations
}

export async function locationExists(locationId: UUID) {
  const db = getClient()

  const result = await db
    .selectFrom('locations')
    .select('id')
    .where('id', '=', locationId)
    .where('deletedAt', 'is', null)
    // should validUntil be considered here?
    .limit(1)
    .executeTakeFirst()

  return !!result
}

export async function getLocationById(locationId: UUID) {
  const db = getClient()

  const row = await db
    .selectFrom('locations')
    .select(['id', 'locationType', 'administrativeAreaId', 'versions'])
    .where('id', '=', locationId)
    .where('deletedAt', 'is', null)
    .executeTakeFirst()

  if (!row) {
    return undefined
  }

  const { versions: rawVersions, ...rest } = row
  const versions = parseVersions(rawVersions, rest.id)

  return {
    ...rest,
    versions,
    ...resolveVersionFields(versions)
  }
}

export function getAdministrativeHierarchyByIdCte(
  id: string | RawBuilder<unknown>
) {
  return sql`
    WITH RECURSIVE area_chain AS (
        -- 1a: Start with location and get its administrative area
        SELECT
            l.id,
            l.administrative_area_id AS parent_id,
            0 AS depth
        FROM app.locations l
        WHERE l.id = ${id}

        UNION ALL

        -- 1b: If location does not exist, start with administrative area directly
        SELECT
            aa.id,
            aa.parent_id,
            0 AS depth
        FROM app.administrative_areas aa
        WHERE aa.id = ${id}
        AND NOT EXISTS (SELECT 1 FROM app.locations WHERE id = ${id})

        UNION ALL

        -- 2: Get administrative area hierarchy recursively
        SELECT
            aa.id,
            aa.parent_id,
            ac.depth + 1
        FROM app.administrative_areas aa
        JOIN area_chain ac ON ac.parent_id = aa.id
    )
  `
}

/**
 * Given a location ID, this function retrieves the full chain of parent administrative areas
 * from `administrative_areas` corresponding to the location's `administrative_area_id`.
 * Returns an array of IDs representing the location's hierarchy, from top-level parent down to the location itself.
 *
 * @param locationId
 * @returns The list of location hierarchy ids, ex: [admin_area_1_id, admin_area_2_id, locationId]
 */

export async function getAdministrativeHierarchyById(
  id: string
): Promise<UUID[]> {
  const cached = administrativeHierarchyByIdCache.get(id)
  if (cached) {
    return cached
  }

  const db = getClient()
  const query = sql<{ ids: UUID[] }>`
    ${getAdministrativeHierarchyByIdCte(id)}
    SELECT array_agg(id ORDER BY depth DESC) AS ids FROM area_chain;
  `

  const promise = db
    .executeQuery(query.compile(db))
    .then((result) => (result.rows.length > 0 ? result.rows[0].ids : []))

  administrativeHierarchyByIdCache.set(id, promise)
  return promise
}

export async function isLocationUnderAdministrativeArea({
  locationId,
  administrativeAreaId
}: {
  locationId: UUID
  administrativeAreaId: UUID
}): Promise<boolean> {
  const db = getClient()

  const query = sql<{ exists: boolean }>`
    ${getAdministrativeHierarchyByIdCte(locationId)}
    SELECT EXISTS (
        SELECT 1 FROM area_chain WHERE id = ${administrativeAreaId}
    ) AS exists;
  `

  const result = await db.executeQuery(query.compile(db))
  return result.rows[0]?.exists ?? false
}
