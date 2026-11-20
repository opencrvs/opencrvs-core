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
import { getClient } from './postgres'
import Hapi from '@hapi/hapi'
import * as z from 'zod/v4'
import { UUID } from '@opencrvs/toolkit/events'
import { sql } from 'kysely'

export const Icd10CodeRecord = z.object({
  id: UUID,
  label: z.string(),
  code: z.string().nullish(),
  ucLabel: z.string(),
  chapterNo: z.string().nullish(),
  chapterRange: z.string().nullish(),
  chapterName: z.string().nullish(),
  subchapterCode: z.string().nullish(),
  subchapterName: z.string().nullish(),
  ncdCdInjuries: z.string().nullish(),
  illDefined: z.string().nullable(),
  validUntil: z.iso.datetime().nullable()
})

export type Icd10CodeRecord = z.infer<typeof Icd10CodeRecord>

export async function causeOfDeathSearchHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const db = getClient()

  const terms = (request.query['terms'] as string)?.trim()

  if (!terms) {
    return h.response({ error: "Missing 'terms' parameter" }).code(400)
  }

  const likeTerm = `%${terms}%`

  try {
    const rows = await db
      .selectFrom('icd10')
      .select([
        'id',
        'label',
        sql<number>`similarity(label, ${terms})`.as('score')
      ])
      .where((eb) =>
        eb.and([
          eb.or([
            eb('label', 'ilike', likeTerm),
            sql<boolean>`label % ${terms}`
          ]),
          eb.or([
            eb('valid_until', 'is', null),
            eb('valid_until', '>', new Date())
          ])
        ])
      )
      .orderBy('score desc')
      .limit(50)
      .execute()

    return h.response({ results: rows }).code(200)
  } catch (err) {
    request.log(['error'], err instanceof Error ? err.message : String(err))
    return h.response({ error: 'Internal server error' }).code(500)
  }
}
