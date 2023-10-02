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
      await db.collection('configs').updateMany(
        {},
        {
          $set: {
            MARRIAGE: {
              REGISTRATION_TARGET: 45,
              FEE: {
                ON_TIME: 10,
                DELAYED: 45
              },
              PRINT_IN_ADVANCE: true
            },
            // Marriage registration should be disabled in production. This is because configurable registration offices, advanced search, performance analytics and dashboard data for marriage is still in development as of OpenCRVS v1.3.
            // Marriage registration is included in this release as a work-in-progress and will be developed further using an appropriate country implementation. For more information, or to request support to develop marriage for your country, email us at team@opencrvs.org
            MARRIAGE_REGISTRATION: false
          }
        }
      )
    })
  } finally {
    console.log(`Migration - Add Marriage Configuration : Done. `)
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('configs')
        .updateMany({}, { $unset: { MARRIAGE: '', MARRIAGE_REGISTRATION: '' } })
    })
  } finally {
    console.log(`Migration - DOWN - Add Marriage Configuration - DONE `)
    await session.endSession()
  }
}
