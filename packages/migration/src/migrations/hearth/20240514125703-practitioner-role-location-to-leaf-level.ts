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
}

export const down = async (db: Db, client: MongoClient) => {
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
