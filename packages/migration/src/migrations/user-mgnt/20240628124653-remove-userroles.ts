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
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('users')
        .updateMany(
          { username: 'o.admin' },
          { $set: { role: 'SUPER_ADMIN' }, $unset: { systemRole: '' } }
        )
      await db
        .collection('users')
        .aggregate([
          {
            $lookup: {
              from: 'userroles',
              localField: 'role',
              foreignField: '_id',
              as: 'roleDetails'
            }
          },
          {
            $unwind: '$roleDetails'
          },
          {
            $addFields: {
              role: {
                $toUpper: {
                  $replaceAll: {
                    input: { $arrayElemAt: ['$roleDetails.labels.label', 0] },
                    find: ' ',
                    replacement: '_'
                  }
                }
              }
            }
          },
          {
            $project: {
              roleDetails: 0
            }
          },
          {
            $merge: {
              into: 'users',
              whenMatched: 'merge',
              whenNotMatched: 'fail'
            }
          }
        ])
        .toArray()
      await db
        .collection('users')
        .updateMany({}, { $unset: { scope: '', systemRoles: '' } })
      const collections = await db
        .listCollections({ name: 'userroles' })
        .toArray()
      if (collections.length > 0) {
        await db.collection('userroles').drop()
      } else {
        console.log('Collection userroles does not exist.')
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}
