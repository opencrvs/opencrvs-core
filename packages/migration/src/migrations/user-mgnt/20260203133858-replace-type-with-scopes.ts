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
  // This migration cannot be reliably reversed because:
  // 1. Multiple types can have the same scopes (e.g., HEALTH and CITIZEN_PORTAL both use record.create, record.notify)
  // 2. Custom scope combinations don't map to any type
  // 3. The type field is deprecated and only existed transiently - it was never part of the long-term data model
  // 
  // If you need to roll back this migration, you'll need to:
  // - Restore the systems collection from a backup taken before the migration
  // - Or manually recreate the type field based on your knowledge of each system's purpose
  throw new Error(
    'Cannot reverse this migration: type cannot be reliably derived from scopes. ' +
    'Restore from backup if rollback is required.'
  )
}

