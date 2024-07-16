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
import { EVENT_TYPE, ValidRecord } from '@opencrvs/commons/types'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { client } from '@search/elasticsearch/client'
import { BirthDocument, SearchDocument } from '@search/elasticsearch/utils'
import { streamAllRecords } from '@search/features/records/service'
import { composeDocument as composeBirthDocument } from '@search/features/registration/birth/service'
import { composeDocument as composeDeathDocument } from '@search/features/registration/death/service'
import { composeDocument as composeMarriageDocument } from '@search/features/registration/marriage/service'
import { logger } from '@opencrvs/commons'
import { getEventType } from '@search/utils/event'
import { Transform } from 'stream'
import { orderBy } from 'lodash'
import { format } from 'date-fns'

const eventTransformers = {
  [EVENT_TYPE.BIRTH]: composeBirthDocument,
  [EVENT_TYPE.DEATH]: composeDeathDocument,
  [EVENT_TYPE.MARRIAGE]: composeMarriageDocument
} satisfies Record<EVENT_TYPE, (record: ValidRecord) => SearchDocument>

export const formatIndexName = () =>
  `${OPENCRVS_INDEX_NAME}-${format(new Date(), 'yyyyMMddHHmmss')}`

/** Streams the MongoDB records to ElasticSearch */
export const reindex = async () => {
  const t1 = performance.now()
  const index = formatIndexName()
  logger.info(`Reindexing to ${index}`)

  const stream = await streamAllRecords(true)

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record: ValidRecord, _encoding, callback) => {
      const transformRecordToDocument = eventTransformers[getEventType(record)]
      callback(null, transformRecordToDocument(record))
    }
  })

  await client.indices.create(
    {
      index,
      body: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0
        }
      }
    },
    {
      meta: true
    }
  )

  await client.helpers.bulk(
    {
      retries: 3,
      wait: 3000,
      datasource: stream.pipe(transformedStreamData),
      onDocument: (doc: BirthDocument) => ({
        index: {
          _index: index,
          _id: doc.compositionId
        }
      }),
      onDrop(doc) {
        throw new Error(
          `Document ${doc.document.compositionId} couldn't be inserted`
        )
      }
    },
    {
      meta: true
    }
  )
  const t2 = performance.now()
  logger.info(
    `Finished reindexing to ${index} in ${((t2 - t1) / 1000).toFixed(
      2
    )} seconds`
  )

  return { index }
}

/**
 * Points the latest index (for example: ocrvs-20240523000000) - to an alias (example: ocrvs)
 */
export async function updateAliases() {
  const { body: indices } = await client.cat.indices(
    {
      format: 'json',
      index: `${OPENCRVS_INDEX_NAME}-*`
    },
    {
      meta: true
    }
  )

  const sortedIndices = orderBy(indices, 'index')
  const { index: latestIndex } = sortedIndices.at(-1)!

  await client.indices.updateAliases(
    {
      body: {
        actions: [
          {
            remove: {
              alias: OPENCRVS_INDEX_NAME,
              index: `${OPENCRVS_INDEX_NAME}-*`
            }
          },
          { add: { alias: OPENCRVS_INDEX_NAME, index: latestIndex } }
        ]
      }
    },
    { meta: true }
  )
}
