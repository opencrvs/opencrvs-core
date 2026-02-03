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

// This migration removes the `type` field from the systems collection
// The scopes are already stored in the database, so we just need to remove the type field
export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      // Remove the type field from all systems
      // The scopes are already properly set in the scope field
      await db.collection('systems').updateMany(
        {},
        {
          $unset: { type: '' }
        }
      )
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      // Restore the type field based on the scopes array
      // This uses the same logic as the original migration that created types from scopes
      
      await db.collection('systems').updateMany({}, [
        {
          $set: {
            type: {
              $cond: {
                if: { $in: ['notification-api', '$scope'] },
                then: 'HEALTH',
                else: {
                  $cond: {
                    if: { $in: ['nationalId', '$scope'] },
                    then: 'NATIONAL_ID',
                    else: {
                      $cond: {
                        if: { $in: ['recordsearch', '$scope'] },
                        then: 'RECORD_SEARCH',
                        else: {
                          $cond: {
                            if: { $in: ['webhook', '$scope'] },
                            then: 'WEBHOOK',
                            else: {
                              $cond: {
                                if: { $in: ['record-import', '$scope'] },
                                then: 'IMPORT_EXPORT',
                                else: {
                                  $cond: {
                                    if: { $in: ['record-reindex', '$scope'] },
                                    then: 'REINDEX',
                                    else: {
                                      $cond: {
                                        if: {
                                          $regexMatch: {
                                            input: { $arrayElemAt: ['$scope', 0] },
                                            regex: /^record\.(read|create|notify)/
                                          }
                                        },
                                        then: 'CITIZEN_PORTAL',
                                        else: null
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
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

