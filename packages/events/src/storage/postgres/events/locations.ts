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

import { sql } from 'kysely'
import { chunk } from 'lodash'
import { Location, LocationType, logger, UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { Locations, NewLocations } from './schema/app/Locations'

const INSERT_MAX_CHUNK_SIZE = 10000

export async function addLocations(locations: NewLocations[]) {
  const db = getClient()

  // Insert new locations in chunks to avoid exceeding max query size
  for (const [index, batch] of chunk(
    locations,
    INSERT_MAX_CHUNK_SIZE
  ).entries()) {
    logger.info(
      `Processing ${Math.min((index + 1) * INSERT_MAX_CHUNK_SIZE, locations.length)}/${locations.length} locations`
    )
    await db
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
          parentId: (eb) => eb.ref('excluded.parentId'),
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

export async function addAdministrativeAreas(administrativeAreas: Location[]) {
  const db = getClient()

  // Insert new locations in chunks to avoid exceeding max query size
  for (const [index, batch] of chunk(
    administrativeAreas,
    INSERT_MAX_CHUNK_SIZE
  ).entries()) {
    logger.info(
      `Processing ${Math.min((index + 1) * INSERT_MAX_CHUNK_SIZE, administrativeAreas.length)}/${administrativeAreas.length} administrative areas`
    )
    await db
      .insertInto('administrativeAreas')
      .values(
        batch.map((loc) => ({
          id: loc.id,
          name: loc.name,
          parentId: loc.parentId,
          validUntil: loc.validUntil,
          deletedAt: null
        }))
      )
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
          validUntil: () =>
            sql`CASE
             WHEN excluded.valid_until IS NOT NULL
             THEN excluded.valid_until
             ELSE administrative_areas.valid_until
           END`,
          deletedAt: null
        })
      )
      .execute()
  }
}

export async function setLocations(locations: NewLocations[]) {
  return addLocations(locations)
}

export async function getLocations({
  locationType,
  locationIds,
  isActive
}: {
  locationType?: LocationType
  locationIds?: UUID[]
  isActive?: boolean
} = {}) {
  const db = getClient()

  let query = db
    .selectFrom('locations')
    .select(['id', 'name', 'parentId', 'validUntil', 'locationType'])
    .where('deletedAt', 'is', null)
    .$narrowType<{
      deletedAt: null
      validUntil: Location['validUntil']
    }>()

  if (locationType) {
    query = query.where('locationType', '=', locationType)
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

function getChildLocationsQuery(parentId: UUID) {
  return sql<Locations>`
    ${childLocationsCte(parentId)}
    SELECT l.*
    FROM app.locations l
    JOIN r ON r.id = l.id
    WHERE l.id <> ${parentId} AND l.deleted_at IS NULL;
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

export async function getChildLocations(parentId: UUID) {
  const db = getClient()

  const { rows } = await getChildLocationsQuery(parentId).execute(db)
  return rows
}

// Check if a location is a leaf location, i.e. it has no children
export async function isLeafLocation(id: UUID) {
  const db = getClient()

  const result = await db
    .selectFrom('locations')
    .select('id')
    .where('parentId', '=', id)
    .limit(1)
    .executeTakeFirst()

  return !result
}

/**
 * Get the leaf location IDs from a list of locations.
 *
 * A leaf location is defined as a location that does not have any children in the provided list.
 * e.g. if a location is a parent of another location in the list, it is not considered a leaf. ADMIN_STRUCTURE might have CRVS_OFFICE children, but can be a leaf if we only consider ADMIN_STRUCTURE locations.
 *
 * @param locationTypes - The types of locations to include.
 * @returns The list of leaf location IDs.
 */
export async function getLeafLocationIds({
  locationTypes
}: { locationTypes?: LocationType[] } = {}) {
  const db = getClient()

  const query = db
    .selectFrom('locations as l')
    .select(['l.id'])
    .where(({ not, exists, selectFrom }) =>
      not(
        exists(
          selectFrom('locations as c')
            .select('c.id')
            .whereRef('c.parentId', '=', 'l.id')
            .$if(!!locationTypes && !!locationTypes.length, (qb) =>
              // @ts-expect-error -- query builder cannot infer the type from the condition above.
              qb.where('c.locationType', 'in', locationTypes)
            )
        )
      )
    )

  if (locationTypes && locationTypes.length > 0) {
    query.where('locationType', 'in', locationTypes)
  }

  return query.execute()
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
