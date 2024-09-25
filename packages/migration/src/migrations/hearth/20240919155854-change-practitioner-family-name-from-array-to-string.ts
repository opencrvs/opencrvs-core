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
  // In most cases the family name is a string, but in some cases it is an array (1.2.x versions at least)
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('Practitioner')
        .updateMany({ 'name.family': { $type: 'array' } }, [
          {
            $set: {
              name: {
                $map: {
                  input: '$name',
                  as: 'n',
                  in: {
                    $mergeObjects: [
                      '$$n',
                      {
                        family: {
                          $cond: {
                            if: { $isArray: '$$n.family' },
                            then: { $arrayElemAt: ['$$n.family', 0] },
                            else: '$$n.family'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        ])
    })
  } catch (err) {
    console.log('Error occurred while updating practitioner family name', err)
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
