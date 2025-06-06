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

import z from 'zod'
import { UUID } from '@opencrvs/commons'
import { getClient, sql } from './db'

export const Location = z.object({
  id: UUID,
  externalId: z.string().nullable(),
  name: z.string(),
  partOf: UUID.nullable()
})

export type Location = z.infer<typeof Location>

export async function setLocations(incomingLocations: Array<Location>) {
  const db = await getClient()

  const ids = incomingLocations.map((l) => l.id)
  const externalIds = incomingLocations.map((l) => l.externalId)
  const names = incomingLocations.map((l) => l.name)
  const partOfs = incomingLocations.map((l) => l.partOf)

  await db.query(sql.type(z.void())`
    INSERT INTO
      locations (id, name, external_id, parent_id)
    SELECT
      *
    FROM
      UNNEST(
        ${sql.array(ids, 'uuid')}::uuid[],
        ${sql.array(names, 'text')},
        ${sql.array(externalIds, 'text')},
        ${sql.array(partOfs, 'uuid')}::uuid[]
      )
  `)
}

export async function getLocations() {
  const db = await getClient()
  const locations = await db.many(sql.type(Location)`
    SELECT
      id,
      name,
      external_id AS "externalId",
      parent_id AS "partOf"
    FROM
      locations
  `)

  return [...locations]
}
