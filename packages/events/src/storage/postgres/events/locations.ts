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
import { Location, logger, UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import { Locations, NewLocations } from './schema/app/Locations'
import LocationType from './schema/app/LocationType'

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

export async function setLocations(locations: NewLocations[]) {
  return addLocations(locations)
}

export async function getLocations({
  locationType,
  locationIds
}: { locationType?: LocationType; locationIds?: UUID[] } = {}) {
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

  return query.execute()
}

export async function getChildLocations(parentId: string) {
  const db = getClient()

  const { rows } = await sql<Locations>`
    WITH RECURSIVE r AS (
      SELECT id, parent_id
      FROM app.locations
      WHERE id = ${parentId} AND deleted_at IS NULL
      UNION ALL
      SELECT l.id, l.parent_id
      FROM app.locations l
      JOIN r ON l.parent_id = r.id
    )
    SELECT l.*
    FROM app.locations l
    JOIN r ON r.id = l.id
    WHERE l.id <> ${parentId} AND l.deleted_at IS NULL;
  `.execute(db)
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
        )
      )
    )

  if (locationTypes && locationTypes.length > 0) {
    query.where('locationType', 'in', locationTypes)
  }

  return query.execute()
}
