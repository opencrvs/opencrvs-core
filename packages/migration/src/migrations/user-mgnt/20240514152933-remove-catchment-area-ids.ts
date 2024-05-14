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
  await db
    .collection('users')
    .updateMany({}, { $unset: { catchmentAreaIds: '' } })
}

const HEARTH_MONGO_URL =
  process.env.HEARTH_MONGO_URL || 'mongodb://localhost/hearth-dev'

let connectedHearthClient: MongoClient

const findHierarchyForOffice = async (officeId: string) => {
  const agg = [
    {
      $match: {
        id: officeId
      }
    },
    {
      $graphLookup: {
        from: 'Location_view_with_plain_ids',
        startWith: '$partOf.reference',
        connectFromField: 'partOf.reference',
        connectToField: 'id',
        as: 'hierarchy',
        depthField: 'level'
      }
    },
    {
      $addFields: {
        allIds: {
          $concatArrays: [
            {
              $map: {
                input: {
                  $reverseArray: '$hierarchy'
                },
                as: 'node',
                in: '$$node.id'
              }
            },
            ['$id']
          ]
        }
      }
    },
    {
      $sort: {
        'hierarchy.depth': -1
      }
    },
    {
      $project: {
        allIds: 1,
        _id: 0
      }
    }
  ]

  const coll = connectedHearthClient
    .db()
    .collection('Location_view_with_plain_ids')
  const cursor = coll.aggregate(agg)
  const [{ allIds }] = await cursor.toArray()
  return allIds
}

export const down = async (db: Db, client: MongoClient) => {
  const cursor = db.collection('users').find()
  const hearthClient = new MongoClient(HEARTH_MONGO_URL)
  connectedHearthClient = await hearthClient.connect()

  while (await cursor.hasNext()) {
    const user = await cursor.next()
    if (!user || !user.primaryOfficeId) continue

    const officeHierarchy = await findHierarchyForOffice(user.primaryOfficeId)

    await db
      .collection('users')
      .updateOne(
        { _id: user._id },
        { $set: { catchmentAreaIds: officeHierarchy } }
      )
  }
  await connectedHearthClient.close()
}
