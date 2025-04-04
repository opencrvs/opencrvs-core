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
  // Add migration logic for applying changes to the database
  // This code will be executed when running the migration
  // It can include creating collections, modifying documents, etc.
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.createCollection('locations')
    })
  } catch (error) {
    console.error(
      'Error occurred while creating events, drafts and location collection:',
      error
    )
    throw error
  } finally {
    session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      // Drop locations collection if it exists
      const locationsExists = await db
        .listCollections({ name: 'locations' })
        .hasNext()
      if (locationsExists) {
        await db.dropCollection('locations')
        console.log('locations collection removed successfully')
      } else {
        console.log('locations collection does not exist, skipping removal')
      }
    })
  } catch (error) {
    console.error('Error occurred while removing collections:', error)
    throw error
  } finally {
    session.endSession()
  }
}
