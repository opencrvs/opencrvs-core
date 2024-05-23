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

import { reindex, client } from '../../utils/elasticsearch-helper.js'
import { Db, MongoClient } from 'mongodb'
const ELASTICSEARCH_INDEX_NAME = 'ocrvs'

/**
 * In case an index doesn't already exist via creating records, lets make it for reindexing to work consistently
 */
export const createEmptyIndex = async () => {
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
export const migrateIndexToAlias = async (timestamp: string) => {
  const { body: doesOcrvsIndexExist } = await client.indices.exists({
    index: ELASTICSEARCH_INDEX_NAME
  })

  if (doesOcrvsIndexExist) {
    return
  }

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

export const up = async (db: Db, client: MongoClient) => {
  await db.collection('PractitionerRole').updateMany({}, [
    {
      $set: {
        location: [
          {
            $arrayElemAt: ['$location', 0]
          }
        ]
      }
    }
  ])

  await createEmptyIndex()
  await migrateIndexToAlias('20240514125703-old-format')
  await reindex('20240514125703')
}

export const down = async (db: Db, client: MongoClient) => {
  // Traverses the locations from leaf level to up,
  // returning Array<{ reference: `Location/${string}` }> where the FIRST item in the array is the smallest (office)
  const pipeline = [
    {
      $addFields: {
        initialLocationId: {
          $arrayElemAt: [
            {
              $split: [
                {
                  $arrayElemAt: ['$location.reference', 0]
                },
                '/'
              ]
            },
            1
          ]
        }
      }
    },
    {
      $graphLookup: {
        from: 'Location_view_with_plain_ids',
        startWith: '$initialLocationId',
        connectFromField: 'partOf.reference',
        connectToField: 'id',
        as: 'locationHierarchy',
        depthField: 'depth'
      }
    },
    {
      $addFields: {
        locationHierarchy: {
          $map: {
            input: '$locationHierarchy',
            as: 'loc',
            in: {
              reference: {
                $concat: ['Location/', '$$loc.id']
              },
              depth: '$$loc.depth'
            }
          }
        }
      }
    },
    {
      $unwind: '$locationHierarchy'
    },
    {
      $sort: {
        'locationHierarchy.depth': 1
      }
    },
    {
      $group: {
        _id: '$_id',
        locationHierarchy: {
          $push: '$locationHierarchy'
        }
      }
    },
    {
      $project: {
        _id: 1,
        location: {
          $map: {
            input: '$locationHierarchy',
            as: 'loc',
            in: {
              reference: '$$loc.reference'
            }
          }
        }
      }
    }
  ]

  const cursor = db.collection('PractitionerRole').aggregate(pipeline)

  for await (const doc of cursor) {
    await db
      .collection('PractitionerRole')
      .updateOne({ _id: doc._id }, { $set: { location: doc.location } })
  }
}
