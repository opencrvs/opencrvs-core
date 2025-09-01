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
import { logger, UUID } from '@opencrvs/commons'
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
          name: (eb) => eb.ref('excluded.name'),
          parentId: (eb) => eb.ref('excluded.parentId'),
          updatedAt: () => sql`now()`,
          deletedAt: null
        })
      )
      .execute()
  }
}

export async function setLocations(locations: NewLocations[]) {
  const db = getClient()
  await db.deleteFrom('locations').execute()
  return addLocations(locations)
}

export async function getLocations() {
  const db = getClient()

  return db
    .selectFrom('locations')
    .selectAll()
    .where('deletedAt', 'is', null)
    .$narrowType<{ deletedAt: null }>()
    .execute()
}

export async function getChildLocations(id: string) {
  const db = getClient()

  const { rows } = await sql<Locations>`
    WITH RECURSIVE r AS (
      SELECT id, parent_id
      FROM app.locations
      WHERE id = ${id} AND deleted_at IS NULL
      UNION ALL
      SELECT l.id, l.parent_id
      FROM app.locations l
      JOIN r ON l.parent_id = r.id
    )
    SELECT l.*
    FROM app.locations l
    JOIN r ON r.id = l.id
    WHERE l.id <> ${id} AND l.deleted_at IS NULL;
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
