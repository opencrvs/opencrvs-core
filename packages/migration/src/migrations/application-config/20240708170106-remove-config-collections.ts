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
      const collInfos = await db.listCollections().toArray()
      const collectionNames = collInfos.map((col) => col.name)

      const collectionsToDelete = ['configs', 'informantsmsnotifications']

      for (const collectionName of collectionsToDelete) {
        if (collectionNames.includes(collectionName)) {
          await db.collection(collectionName).drop()
          console.log(
            `\x1b[36m${collectionName} is dropped from the db.\x1b[0m`
          )
        }
      }
    })
  } finally {
    console.log(
      'Migration - Remove config and informantsmsnotifications successful'
    )
    session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
