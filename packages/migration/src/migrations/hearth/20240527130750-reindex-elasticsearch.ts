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

import { Db, MongoClient } from 'mongodb'
import { client } from '../../utils/elasticsearch-helper.js'

const ELASTICSEARCH_INDEX_NAME = 'ocrvs'

/**
 * In case an index doesn't already exist via creating records, lets make it for reindexing to work consistently
 */
const createEmptyIndex = async () => {
  const { body: doesOcrvsAliasExist } = await client.indices.existsAlias({
    name: ELASTICSEARCH_INDEX_NAME
  })
  const { body: doesOcrvsIndexExist } = await client.indices.exists({
    index: ELASTICSEARCH_INDEX_NAME
  })

  if (doesOcrvsAliasExist || doesOcrvsIndexExist) {
    return
  }

  await client.indices.create({
    index: ELASTICSEARCH_INDEX_NAME,
    body: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      }
    }
  })
}

/**
 * In case the application still uses a single index instead of pointing an single alias to any index, let's migrate.
 */
const migrateIndexToAlias = async (timestamp: string) => {
  // set the index read-only to prevent writes while cloning
  await client.indices.putSettings({
    index: ELASTICSEARCH_INDEX_NAME,
    body: {
      settings: {
        'index.blocks.write': true
      }
    }
  })
  await client.indices.clone({
    index: ELASTICSEARCH_INDEX_NAME,
    target: `${ELASTICSEARCH_INDEX_NAME}-${timestamp}`
  })
  await client.indices.delete({ index: ELASTICSEARCH_INDEX_NAME })
}

export const up = async (db: Db, _client: MongoClient) => {
  await createEmptyIndex()
  await migrateIndexToAlias('20240514125702-old-format')
}

export const down = async (db: Db, _client: MongoClient) => {
  const BACKUP_INDEX = `${ELASTICSEARCH_INDEX_NAME}-20240514125702-old-format`
  const { body: doesTargetIndexExist } = await client.indices.exists({
    index: BACKUP_INDEX
  })

  if (!doesTargetIndexExist) {
    throw new Error(
      "The old format backupped index doesn't exist. You may be running migrations down after the backup has been pruned or removed manually"
    )
  }

  const aliasResponse = await client.indices.getAlias({
    name: ELASTICSEARCH_INDEX_NAME
  })
  const indexWithOcrvsAlias = Object.keys(aliasResponse.body)[0]
  await client.indices.deleteAlias({
    index: indexWithOcrvsAlias,
    name: ELASTICSEARCH_INDEX_NAME
  })

  await client.indices.putSettings({
    index: BACKUP_INDEX,
    body: {
      settings: {
        'index.blocks.write': true
      }
    }
  })

  await client.indices.clone({
    index: BACKUP_INDEX,
    target: ELASTICSEARCH_INDEX_NAME
  })

  await client.indices.putSettings({
    index: BACKUP_INDEX,
    body: {
      settings: {
        'index.blocks.write': false
      }
    }
  })

  await client.indices.delete({ index: `${ELASTICSEARCH_INDEX_NAME}-*` })
}
