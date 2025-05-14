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
import {
  EVENT_TYPE,
  ValidRecord,
  SearchDocument
} from '@opencrvs/commons/types'
import { OPENCRVS_INDEX_NAME } from '@search/constants'
import { getOrCreateClient } from '@search/elasticsearch/client'
import { BirthDocument } from '@search/elasticsearch/utils'
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
  `${OPENCRVS_INDEX_NAME}-${format(new Date(), 'yyyyMMddHHmmssSS')}`

/** Streams the MongoDB records to ElasticSearch */
export const reindex = async () => {
  const t1 = performance.now()
  const index = formatIndexName()

  logger.info(`Reindexing to ${index}`)
  const client = getOrCreateClient()

  const stream = await streamAllRecords(true)

  const transformedStreamData = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (record: ValidRecord, _encoding, callback) => {
      const transformRecordToDocument = eventTransformers[getEventType(record)]
      callback(null, transformRecordToDocument(record))
    }
  })

  await client.indices.create({
    index,
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0
    }
  })

  const droppedCompositionIds: string[] = []

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
        droppedCompositionIds.push(doc.document.compositionId)
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

  if (droppedCompositionIds.length) {
    logger.error(`Could not index ${droppedCompositionIds.length} document(s)`)
    logger.error(droppedCompositionIds.join(', '))
  }

  return { index }
}

/**
 * Points the latest index (for example: ocrvs-20240523000000) - to an alias (example: ocrvs)
 */
export async function updateAliases() {
  const client = getOrCreateClient()

  const indices =
    (await client.cat.indices({
      format: 'json',
      index: `${OPENCRVS_INDEX_NAME}-*`
    })) ?? []

  const sortedIndices = orderBy(indices, (index) => index.index, 'desc')

  const latestIndexName = sortedIndices[0]?.index

  if (!latestIndexName) {
    logger.error('No indices found. Skipping alias update')
    return
  }

  await client.indices.updateAliases({
    actions: [
      {
        remove: {
          alias: OPENCRVS_INDEX_NAME,
          index: `${OPENCRVS_INDEX_NAME}-*`
        }
      },
      { add: { alias: OPENCRVS_INDEX_NAME, index: latestIndexName } }
    ]
  })
}

/**
 * Ensures @see OPENCRVS_INDEX_NAME index does not exist. If it does, it creates a copy of it with a timestamped name.
 * Going forward reindexing is done on a new index @see formatIndexName which uses OPENCRVS_INDEX_NAME as an alias.
 *
 *  Alias and index share the same namespace, so we can't have an index and an alias with the same name.
 */
export async function backupLegacyIndex() {
  logger.info(`Checking if ${OPENCRVS_INDEX_NAME} index exists...`)
  const client = getOrCreateClient()

  const ocrvsIndexExists = await client.indices.exists({
    index: OPENCRVS_INDEX_NAME
  })

  const ocrvsIndexAliasExists = await client.indices.existsAlias({
    name: OPENCRVS_INDEX_NAME
  })

  // indices.exists() returns true if the index exists or if the alias exists
  const hasLegacyIndex = ocrvsIndexExists && !ocrvsIndexAliasExists

  if (hasLegacyIndex) {
    // Since the approach is not atomic, we create backup index with a timestamped name.
    // If the actual reindexing from mongodb goes through, this will be removed
    const timestampedBackupIndexName = `${formatIndexName()}-legacy-backup`

    logger.info(
      `${OPENCRVS_INDEX_NAME} index exists, creating a copy as ${timestampedBackupIndexName}`
    )

    await client.indices.putSettings({
      index: OPENCRVS_INDEX_NAME,
      settings: {
        'index.blocks.write': true
      }
    })

    await client.indices.clone({
      index: OPENCRVS_INDEX_NAME,
      target: timestampedBackupIndexName
    })

    logger.info(`Deleting ${OPENCRVS_INDEX_NAME} index`)

    await client.indices.delete({ index: OPENCRVS_INDEX_NAME })
  } else {
    logger.info(`${OPENCRVS_INDEX_NAME} index does not exist`)
  }
}
