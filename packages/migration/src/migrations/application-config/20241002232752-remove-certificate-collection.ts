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
      const collectionExists = await db
        .listCollections({ name: 'certificates' })
        .hasNext()

      if (collectionExists) {
        await db.collection('certificates').drop()
        console.log('Certificates collection removed successfully')
      } else {
        console.log('Certificates collection does not exist, skipping removal')
      }
    })
  } catch (error) {
    console.error(
      'Error occurred while removing certificates collection:',
      error
    )
    throw error
  } finally {
    session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const collectionExists = await db
        .listCollections({ name: 'certificates' })
        .hasNext()

      if (!collectionExists) {
        await db.createCollection('certificates')
        console.log('Certificates collection recreated successfully')
      } else {
        console.log(
          'Certificates collection already exists, skipping recreation'
        )
      }
    })
  } catch (error) {
    console.error(
      'Error occurred while recreating certificates collection:',
      error
    )
    throw error
  } finally {
    session.endSession()
  }
}
