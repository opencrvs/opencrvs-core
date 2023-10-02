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
    await db
      .collection('systems')
      .updateMany({}, { $set: { 'settings.webhook': [] } })

    // If "notification-api" in `scope` array, type = "HEALTH"
    // If "nationalId" in `scope` array, type = "NATIONAL_ID"
    // If "recordsearch" in `scope` array, type = "RECORD_SEARCH"
    // If "webhook" in `scope` array, type = "WEBHOOK"
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
    ])

    // Update createdBy to be userId instead of UserNameSchema
    // Update name to be string instead of UserNameSchema
    const natlSysAdmin = await db
      .collection('users')
      .findOne({ role: 'NATIONAL_SYSTEM_ADMIN' })

    if (natlSysAdmin) {
      const adminFirstNames = natlSysAdmin.name[0].given.join(' ')

      await db.collection('systems').updateMany({}, [
        {
          $set: {
            createdBy: natlSysAdmin._id,
            name:
              adminFirstNames.length > 0
                ? adminFirstNames + ' ' + natlSysAdmin.name[0].family
                : natlSysAdmin.name[0].family
          }
        }
      ])
    }
  } finally {
    await session.endSession()
  }
}
export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const natlSysAdmin = await db
        .collection('users')
        .findOne({ role: 'NATIONAL_SYSTEM_ADMIN' })

      await db.collection('systems').updateMany({}, [
        {
          $set: {
            createdBy: natlSysAdmin?.name,
            name: natlSysAdmin?.name
          }
        }
      ])

      await db.collection('systems').updateMany({}, { $unset: { type: '' } })
      await db
        .collection('systems')
        .updateMany({}, { $unset: { 'settings.webhook': '' } })
    })
  } finally {
    await session.endSession()
  }
}
