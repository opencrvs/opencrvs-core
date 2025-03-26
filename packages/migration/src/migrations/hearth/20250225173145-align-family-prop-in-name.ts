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
        .collection('Patient')
        .updateMany({ 'name.family': { $exists: true } }, [
          {
            $set: {
              name: {
                $map: {
                  input: '$name',
                  as: 'name',
                  in: {
                    $cond: {
                      if: {
                        $isArray: '$$name.family'
                      },
                      then: {
                        $mergeObjects: [
                          '$$name',
                          {
                            family: {
                              $trim: {
                                input: {
                                  $reduce: {
                                    input: '$$name.family',
                                    initialValue: '',
                                    in: {
                                      $concat: ['$$value', ' ', '$$this']
                                    }
                                  }
                                }
                              }
                            }
                          }
                        ]
                      },
                      else: '$$name'
                    }
                  }
                }
              }
            }
          }
        ])
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('Patient')
        .updateMany({ 'name.family': { $exists: true } }, [
          {
            $set: {
              name: {
                $map: {
                  input: '$name',
                  as: 'name',
                  in: {
                    $cond: {
                      if: {
                        $gt: ['$$name.family', null]
                      },
                      then: {
                        $mergeObjects: [
                          '$$name',
                          {
                            family: ['$$name.family']
                          }
                        ]
                      },
                      else: '$$name'
                    }
                  }
                }
              }
            }
          }
        ])
    })
  } finally {
    await session.endSession()
  }
}
