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
import { getClient } from '@events/storage/postgres/events'
import { Locations, NewLocations } from './schema/app/Locations'

export async function setLocations(locations: NewLocations[]) {
  const db = getClient()
  const locationIds = locations.map(({ id }) => id)

  await db
    .insertInto('locations')
    .values(locations.map((loc) => ({ ...loc, deletedAt: null })))
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        name: (eb) => eb.ref('excluded.name'),
        parentId: (eb) => eb.ref('excluded.parentId'),
        updatedAt: () => sql`now()`,
        deletedAt: null
      })
    )
    .execute()

  await db
    .updateTable('locations')
    .set({ deletedAt: sql`now()` })
    .where('deletedAt', 'is', null)
    .where('id', 'not in', locationIds)
    .execute()
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
      WHERE id = ${id}
      UNION ALL
      SELECT l.id, l.parent_id
      FROM app.locations l
      JOIN r ON l.parent_id = r.id
    )
    SELECT l.*
    FROM app.locations l
    JOIN r ON r.id = l.id
    WHERE l.id <> ${id};
  `.execute(db)
  return rows
}
