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
    await db.collection('users').updateMany(
      { identifiers: { $exists: true } }, // Only affect documents that have the identifiers field
      { $unset: { identifiers: '' } } // Remove the identifiers field
    )
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
  const session = client.startSession()
  try {
    await db.collection('users').updateMany(
      { identifiers: { $exists: false } }, // Only affect documents that no longer have the identifiers field
      { $set: { identifiers: [] } } // Re-add identifiers as an empty array
    )
  } finally {
    await session.endSession()
  }
}
