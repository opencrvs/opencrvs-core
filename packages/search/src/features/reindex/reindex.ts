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
import { OnDropDocument } from '@elastic/elasticsearch/lib/Helpers'
import { EVENT_TYPE, ValidRecord } from '@opencrvs/commons/types'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { client } from '@search/elasticsearch/client'
import { BirthDocument, SearchDocument } from '@search/elasticsearch/utils'
import { streamAllRecords } from '@search/features/records/service'
import { composeDocument as composeBirthDocument } from '@search/features/registration/birth/service'
import { composeDocument as composeDeathDocument } from '@search/features/registration/death/service'
import { composeDocument as composeMarriageDocument } from '@search/features/registration/marriage/service'
import { logger } from '@search/logger'
import { getEventType } from '@search/utils/event'
import { format, startOfDay } from 'date-fns'
import { Transform } from 'node:stream'

const eventTransformers = {
  [EVENT_TYPE.BIRTH]: composeBirthDocument,
  [EVENT_TYPE.DEATH]: composeDeathDocument,
  [EVENT_TYPE.MARRIAGE]: composeMarriageDocument
} satisfies Record<EVENT_TYPE, (record: ValidRecord) => SearchDocument>

export const timestampedIndex = (date: Date, suffix = '') =>
  `${OPENCRVS_INDEX_NAME}-${format(date, 'RRRRMMddHHmmss')}${suffix}`

/** Streams the MongoDB records to ElasticSearch */
export const reindex = async (newIndexName = timestampedIndex(new Date())) => {
  const t1 = performance.now()
  logger.info(`Reindexing to ${newIndexName}`)

  const stream = await streamAllRecords(true)

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record: ValidRecord, _encoding, callback) => {
      const transformRecordToDocument = eventTransformers[getEventType(record)]
      callback(null, transformRecordToDocument(record))
    }
  })

  await client.helpers.bulk({
    retries: 3,
    wait: 3000,
    datasource: stream.pipe(transformedStreamData),
    onDocument: (doc: BirthDocument) => ({
      index: {
        _index: newIndexName,
        _id: doc.compositionId
      }
    }),
    onDrop(doc: OnDropDocument<BirthDocument>) {
      throw new Error(
        `Document ${doc.document.compositionId} couldn't be inserted`
      )
    }
  })
  const t2 = performance.now()
  logger.info(
    `Finished reindexing to ${newIndexName} in ${((t2 - t1) / 1000).toFixed(
      2
    )} seconds`
  )
}

export const migrate = async () => {
  const newIndexName = timestampedIndex(startOfDay(new Date()), '-old-format')
  logger.info(`Migrating ${OPENCRVS_INDEX_NAME} to index ${newIndexName}.`)

  // set the index read-only to prevent writes while cloning
  await client.indices.putSettings({
    index: OPENCRVS_INDEX_NAME,
    body: {
      settings: {
        'index.blocks.write': true
      }
    }
  })
  await client.indices.clone({
    index: OPENCRVS_INDEX_NAME,
    target: newIndexName
  })
  await client.indices.delete({ index: OPENCRVS_INDEX_NAME })
  logger.info(`Migrating done`)
}
