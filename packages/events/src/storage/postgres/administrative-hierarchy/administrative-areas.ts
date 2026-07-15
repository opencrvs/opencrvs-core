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
import { logger, SetAdministrativeAreaPayload, UUID } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'
import Schema from '../events/schema/Database'
import { buildInitialVersions, resolveVersionFields } from './locations'

export async function getAdministrativeAreas({
  ids,
  isActive
}: {
  ids?: UUID[]
  isActive?: boolean
} = {}) {
  const db = getClient()

  let query = db
    .selectFrom('administrativeAreas')
    .select(['id', 'parentId', 'versions'])
    .where('deletedAt', 'is', null)

  if (ids && ids.length > 0) {
    query = query.where('id', 'in', ids)
  }

  if (isActive) {
    query = query.where((eb) =>
      eb.or([eb('validUntil', 'is', null), eb('validUntil', '>', 'now()')])
    )
  }

  const rows = await query.execute()

  return rows.map(({ versions, ...row }) => ({
    ...row,
    ...resolveVersionFields(versions)
  }))
}

const INSERT_MAX_CHUNK_SIZE = 1000

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
      .values(
        batch.map((aa) => ({
          id: aa.id,
          name: aa.name,
          parentId: aa.parentId,
          deletedAt: null,
          externalId: aa.externalId,
          versions: buildInitialVersions(aa)
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
          externalId: () =>
            sql`CASE
             WHEN excluded.external_id IS NOT NULL
             THEN excluded.external_id
             ELSE administrative_areas.external_id
           END`,
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

/**
 * A leaf administrative level is defined as an administrative area which does not have any other administrative areas as children.
 * Administrative areas that have locations as children are still considered leaf levels.
 *
 * @returns List of leaf level administrative area ids.
 */
let leafLevelAdministrativeAreaIdsCache: Promise<{ id: UUID }[]> | null = null

export async function getLeafLevelAdministrativeAreaIds() {
  if (!leafLevelAdministrativeAreaIdsCache) {
    const db = getClient()

    leafLevelAdministrativeAreaIdsCache = db
      .selectFrom('administrativeAreas as a1')
      .select(['a1.id'])
      .where(({ not, exists, selectFrom }) =>
        not(
          exists(
            selectFrom('administrativeAreas as a2')
              .select('a2.id')
              .whereRef('a2.parentId', '=', 'a1.id')
          )
        )
      )
      .execute()
  }

  return leafLevelAdministrativeAreaIdsCache
}
