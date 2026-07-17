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
  LocationStatus,
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
 * area row on insert: a single element. By default (seeding) the element is
 * active and effective from the beginning of time with a generated id; the
 * create path may supply `versionId`, `effectiveFrom` and `status` explicitly.
 */
export function buildInitialVersions({
  name,
  externalId,
  versionId,
  effectiveFrom,
  status
}: {
  name: string
  externalId?: string | null
  versionId?: UUID
  effectiveFrom?: string
  status?: LocationStatus
}): RawBuilder<LocationVersion[]> {
  const versions: LocationVersion[] = [
    {
      versionId: versionId ?? getUUID(),
      effectiveFrom: effectiveFrom ?? '0001-01-01',
      name,
      externalId: externalId ?? null,
      status: status ?? 'active'
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
 *
 * When every version is still in the future (a location that does not exist
 * yet), `resolveVersion` falls back to the earliest element so the name still
 * renders — but the location must not be treated as active before its first
 * `effectiveFrom`, so `status` is forced to 'inactive'.
 */
export function resolveVersionFields(versions: LocationVersion[]) {
  const today = new Date().toISOString().slice(0, 10)
  const current = resolveVersion(versions, today)
  const isFuture = current.effectiveFrom > today

  return {
    name: current.name,
    externalId: current.externalId ?? null,
    status: isFuture ? ('inactive' as const) : current.status
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

/** The fully resolved values of a location create request. */
export interface CreateLocationRow {
  id: UUID
  versionId: UUID
  name: string
  externalId: string | null
  administrativeAreaId: UUID | null
  locationType: string | null
  effectiveFrom: string
  status: LocationStatus
}

/**
 * Inserts a single new location with a one-element `versions` history built
 * from the resolved create values. Deliberately has no conflict handling —
 * id collisions must surface to the caller.
 *
 * The legacy `external_id` column is intentionally NOT populated: the code
 * lives in the versions array, and the column's absolute UNIQUE constraint
 * would otherwise block legitimate code reuse (an inactivated location's
 * code moving to its successor). The legacy `name` column is still written
 * (NOT NULL) — legacy columns hold the creation-time snapshot at best.
 */
export async function createLocation(
  location: CreateLocationRow,
  db: Kysely<Schema> = getClient()
) {
  await db
    .insertInto('locations')
    .values({
      id: location.id,
      name: location.name,
      externalId: null,
      administrativeAreaId: location.administrativeAreaId,
      locationType: location.locationType,
      deletedAt: null,
      versions: buildInitialVersions(location)
    })
    .execute()

  clearAdministrativeHierarchyCache()
}

/**
 * The locked row and trx-bound operations handed to the
 * {@link withLockedVersionedRow} callback. Everything runs on the transaction
 * connection so invariant checks and the append serialise on the row lock —
 * and never borrow a second pool connection mid-transaction.
 */
export interface LockedVersionedRowContext {
  row:
    | {
        id: UUID
        deletedAt: string | null
        versions: LocationVersion[]
      }
    | undefined
  /** Appends a single element to the row's `versions` jsonb array. Touches no
   *  other column — legacy columns stay frozen at their creation values. */
  append: (version: LocationVersion) => Promise<void>
  /** Trx-bound twin of `getLocationsEverHoldingExternalId` /
   *  `getAdministrativeAreasEverHoldingExternalId` for the same table. */
  getCandidatesEverHoldingExternalId: (
    externalId: string
  ) => Promise<{ id: UUID; versions: LocationVersion[] }[]>
  /** Serialises writers of the same external code across rows (and across the
   *  create path). The row lock alone cannot prevent two concurrent writes
   *  claiming the same code on different rows; this advisory lock (released at
   *  transaction end) makes the second writer wait and then see the first
   *  writer's committed claim. Must be taken BEFORE the candidates check. */
  lockExternalId: (externalId: string) => Promise<void>
}

/**
 * Runs `callback` inside a transaction holding a `SELECT ... FOR UPDATE` lock
 * on the given locations / administrative-areas row, so concurrent updates to
 * the same row serialise: the second writer blocks until the first commits and
 * then re-reads the committed row. The row is fetched without the soft-delete
 * filter — soft-deleted handling is the caller's decision.
 */
export async function withLockedVersionedRow<T>(
  table: 'locations' | 'administrativeAreas',
  id: UUID,
  callback: (context: LockedVersionedRowContext) => Promise<T>
): Promise<T> {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    const row = await trx
      .selectFrom(table)
      .select(['id', 'deletedAt', 'versions'])
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst()

    return callback({
      row: row && { ...row, versions: parseVersions(row.versions, row.id) },
      append: async (version) => {
        await trx
          .updateTable(table)
          .set({
            versions: sql`versions || ${JSON.stringify([version])}::jsonb`
          })
          .where('id', '=', id)
          .execute()
      },
      getCandidatesEverHoldingExternalId: async (externalId) => {
        const rows = await trx
          .selectFrom(table)
          .select(['id', 'versions'])
          .where('deletedAt', 'is', null)
          .where(
            sql<boolean>`versions @> ${JSON.stringify([{ externalId }])}::jsonb`
          )
          .execute()

        return rows.map(({ versions: rawVersions, id: rowId }) => ({
          id: rowId,
          versions: parseVersions(rawVersions, rowId)
        }))
      },
      lockExternalId: async (externalId) => {
        await sql`SELECT pg_advisory_xact_lock(hashtext(${externalId}))`.execute(
          trx
        )
      }
    })
  })
}

/**
 * Runs `run` inside a transaction holding the external-code advisory lock (no
 * lock when the code is null), so concurrent creates — and creates racing
 * updates — that claim the same code serialise. The callback receives the
 * transaction to run its uniqueness check and insert on the same connection.
 */
export async function withExternalIdLock<T>(
  externalId: string | null,
  run: (trx: Kysely<Schema>) => Promise<T>
): Promise<T> {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    if (externalId !== null) {
      await sql`SELECT pg_advisory_xact_lock(hashtext(${externalId}))`.execute(
        trx
      )
    }
    return run(trx)
  })
}

export async function withLockedLocationRow<T>(
  locationId: UUID,
  callback: (context: LockedVersionedRowContext) => Promise<T>
): Promise<T> {
  return withLockedVersionedRow('locations', locationId, callback)
}

/**
 * Fetches a location row by id without the soft-delete filter and without
 * resolving version fields. Used by the create path to detect idempotent
 * retries against any existing row, including soft-deleted ones.
 */
export async function getLocationRowById(locationId: UUID) {
  const db = getClient()

  const row = await db
    .selectFrom('locations')
    .select([
      'id',
      'name',
      'externalId',
      'administrativeAreaId',
      'locationType',
      'versions'
    ])
    .where('id', '=', locationId)
    .executeTakeFirst()

  if (!row) {
    return undefined
  }

  return { ...row, versions: parseVersions(row.versions, row.id) }
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
    // Containment only narrows to rows that carried the code at some point;
    // the current-code match happens after row mapping below.
    query = query.where(
      sql<boolean>`versions @> ${JSON.stringify([{ externalId }])}::jsonb`
    )
  }

  if (locationIds && locationIds.length > 0) {
    query = query.where('id', 'in', locationIds)
  }

  const rows = await query.execute()

  let locations = rows.map(({ versions: rawVersions, ...row }) => {
    const versions = parseVersions(rawVersions, row.id)
    return { ...row, versions, ...resolveVersionFields(versions) }
  })

  // externalId and active status are resolved from the versions array (the
  // version in effect today), so both filters run after row mapping rather
  // than in SQL.
  if (externalId) {
    locations = locations.filter(
      (location) => location.externalId === externalId
    )
  }

  if (isActive) {
    locations = locations.filter((location) => location.status === 'active')
  }

  return locations
}

/**
 * Returns all locations whose versions array carried the given externalId at
 * any point (past, current or future) — unlike `getLocations({ externalId })`,
 * which matches the current code only. Used by the create/update uniqueness
 * check, which needs to inspect each candidate's whole timeline.
 */
export async function getLocationsEverHoldingExternalId(
  externalId: string,
  db: Kysely<Schema> = getClient()
) {
  const rows = await db
    .selectFrom('locations')
    .select(['id', 'versions'])
    .where('deletedAt', 'is', null)
    .where(sql<boolean>`versions @> ${JSON.stringify([{ externalId }])}::jsonb`)
    .execute()

  return rows.map(({ versions: rawVersions, id }) => ({
    id,
    versions: parseVersions(rawVersions, id)
  }))
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
