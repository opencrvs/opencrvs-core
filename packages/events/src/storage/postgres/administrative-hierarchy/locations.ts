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

import { Kysely, sql } from 'kysely'
import { chunk } from 'lodash'
import { Location, logger, UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { NewLocations } from '../events/schema/app/Locations'
import Schema from '../events/schema/Database'

const INSERT_MAX_CHUNK_SIZE = 10000

export async function setLocationsInTrx(
  trx: Kysely<Schema>,
  locations: NewLocations[]
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
      .values(batch.map((loc) => ({ ...loc, deletedAt: null })))
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
          validUntil: () =>
            sql`CASE
             WHEN excluded.valid_until IS NOT NULL
             THEN excluded.valid_until
             ELSE locations.valid_until
           END`,
          deletedAt: null
        })
      )
      .execute()
  }
}

export async function setLocations(locations: NewLocations[]) {
  const db = getClient()

  await setLocationsInTrx(db, locations)
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
    .select([
      'id',
      'name',
      'validUntil',
      'locationType',
      'externalId',
      'administrativeAreaId'
    ])
    .where('deletedAt', 'is', null)
    .$narrowType<{
      deletedAt: null
      validUntil: Location['validUntil']
    }>()

  if (locationType) {
    query = query.where('locationType', '=', locationType)
  }

  if (externalId) {
    query = query.where('externalId', '=', externalId)
  }

  if (locationIds && locationIds.length > 0) {
    query = query.where('id', 'in', locationIds)
  }

  if (isActive) {
    query = query.where((eb) =>
      eb.or([eb('validUntil', 'is', null), eb('validUntil', '>', 'now()')])
    )
  }

  return query.execute()
}

/** @returns a recursive CTE that can be used to get all child locations of a given location */
function childLocationsCte(parentId: UUID) {
  return sql`
    WITH RECURSIVE r AS (
      SELECT id, parent_id
      FROM app.locations
      WHERE id = ${parentId} AND deleted_at IS NULL
      UNION ALL
      SELECT l.id, l.parent_id
      FROM app.locations l
      JOIN r ON l.parent_id = r.id
    )
  `
}

function isLocationChildOfQuery(parentId: UUID, givenId: UUID) {
  return sql<{ isChild: boolean }>`
    ${childLocationsCte(parentId)}
    SELECT EXISTS (
      SELECT 1 FROM r WHERE id = ${givenId} AND id <> ${parentId}
    ) AS "isChild";
  `
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

/**
 * Recursive check to see if a location is descendant of a jurisdiction location.
 * @returns is the location **under** the jurisdiction of another location.
 */
export async function isLocationUnderJurisdiction({
  jurisdictionLocationId,
  locationToSearchId
}: {
  jurisdictionLocationId: UUID
  locationToSearchId: UUID
}) {
  const db = getClient()

  const result = await isLocationChildOfQuery(
    jurisdictionLocationId,
    locationToSearchId
  ).execute(db)

  return !!result.rows[0].isChild
}

export async function getLocationById(locationId: UUID) {
  const db = getClient()

  return db
    .selectFrom('locations')
    .select([
      'id',
      'name',
      'administrativeAreaId',
      'validUntil',
      'locationType'
    ])
    .where('id', '=', locationId)
    .where('deletedAt', 'is', null)
    .$narrowType<{
      deletedAt: null
      validUntil: Location['validUntil']
    }>()
    .executeTakeFirst()
}

/**
 * Given a location ID, this function retrieves the full chain of parent administrative areas
 * from `administrative_areas` corresponding to the location's `administrative_area_id`.
 * Returns an array of IDs representing the location's hierarchy, from top-level parent down to the location itself.
 *
 * @param locationId
 * @returns The list of location hierarchy ids, ex: [admin_area_1_id, admin_area_2_id, locationId]
 */
export async function getLocationHierarchyRaw(locationId: string) {
  const db = getClient()

  const query = sql<{ ids: UUID[] }>`
    WITH RECURSIVE area_chain AS (
        -- Base case: Start with the location itself
        SELECT
            l.id,
            l.administrative_area_id AS parent_id,
            0 AS depth

        FROM app.locations l
        WHERE l.id = ${locationId}

        UNION ALL

        -- Recursive case: Get administrative areas
        SELECT
            aa.id,
            aa.parent_id,
            ac.depth + 1

        FROM app.administrative_areas aa
        JOIN area_chain ac
            ON ac.parent_id = aa.id
    )
    SELECT array_agg(id ORDER BY depth DESC) AS ids FROM area_chain;
  `

  const result = await db.executeQuery(query.compile(db))

  return result.rows.length > 0 ? result.rows[0].ids : []
}
