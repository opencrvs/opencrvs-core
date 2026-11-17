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
import { logger } from '@countryconfig/logger'
import { chunk } from 'lodash'
import { getClient } from './postgres'
import { readCSVToJSON } from '@countryconfig/utils'
import { Icd10CodeRecord } from './handler'
import { sql } from 'kysely'

const INSERT_MAX_CHUNK_SIZE = 1000

export async function syncReferenceData() {
  const client = getClient()

  const icd10Records = await readCSVToJSON<Icd10CodeRecord[]>(
    './src/data-seeding/reference-data/source/dictionary.csv'
  )

  await client.transaction().execute(async (trx) => {
    for (const [index, batch] of chunk(
      icd10Records,
      INSERT_MAX_CHUNK_SIZE
    ).entries()) {
      logger.info(
        `Processing ${Math.min((index + 1) * INSERT_MAX_CHUNK_SIZE, icd10Records.length)}/${icd10Records.length} icd10 codes`
      )

      await trx
        .insertInto('reference_data.icd10')
        .values(
          batch.map((l) => ({
            id: l.id,
            label: l.label,
            code: l.code,
            ucLabel: l.uc_label,
            chapterNo: l.chapter_no,
            chapterRange: l.chapter_range,
            chapterName: l.chapter_name,
            subchapterCode: l.subchapter_code,
            subchapterName: l.subchapter_name,
            ncdCdInjuries: l.ncd_cd_injuries,
            illDefined: l.ill_defined,
            validUntil: l.validUntil
          }))
        )
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            label: () => sql`CASE
              WHEN excluded.label IS NOT NULL
              THEN excluded.label
              ELSE reference_data.icd10.label
            END`,
            code: () => sql`CASE
              WHEN excluded.code IS NOT NULL
              THEN excluded.code
              ELSE reference_data.icd10.code
            END`,
            ucLabel: () => sql`CASE
              WHEN excluded.uc_label IS NOT NULL
              THEN excluded.uc_label
              ELSE reference_data.icd10.uc_label
            END`,
            chapterNo: () => sql`CASE
              WHEN excluded.chapter_no IS NOT NULL
              THEN excluded.chapter_no
              ELSE reference_data.icd10.chapter_no
            END`,
            chapterRange: () => sql`CASE
              WHEN excluded.chapter_range IS NOT NULL
              THEN excluded.chapter_range
              ELSE reference_data.icd10.chapter_range
            END`,
            chapterName: () => sql`CASE
              WHEN excluded.chapter_name IS NOT NULL
              THEN excluded.chapter_name
              ELSE reference_data.icd10.chapter_name
            END`,
            subchapterCode: () => sql`CASE
              WHEN excluded.subchapter_code IS NOT NULL
              THEN excluded.subchapter_code
              ELSE reference_data.icd10.subchapter_code
            END`,
            subchapterName: () => sql`CASE
              WHEN excluded.subchapter_name IS NOT NULL
              THEN excluded.subchapter_name
              ELSE reference_data.icd10.subchapter_name
            END`,
            ncdCdInjuries: () => sql`CASE
              WHEN excluded.ncd_cd_injuries IS NOT NULL
              THEN excluded.ncd_cd_injuries
              ELSE reference_data.icd10.ncd_cd_injuries
            END`,
            illDefined: () => sql`CASE
              WHEN excluded.ill_defined IS NOT NULL
              THEN excluded.ill_defined
              ELSE reference_data.icd10.ill_defined
            END`,
            validUntil: () =>
              sql`CASE
              WHEN excluded.valid_until IS NOT NULL
              THEN excluded.valid_until
              ELSE reference_data.icd10.valid_until
            END`,
            updatedAt: () => sql`now()`
          })
        )
        .execute()
    }
  })
}
