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

// Set users status to pending, as the password hashing method has changed to more secure, so we need to invalidate the old hashes.
// also rename the passwordHash field to oldPasswordHash, so that the users can re-apply their passwords.
export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await db.collection('users').updateMany(
      {
        $and: [
          { scope: { $exists: true } },
          { passwordHash: { $exists: true } }
        ]
      },
      {
        $set: { status: 'pending' },
        $rename: { passwordHash: 'oldPasswordHash' }
      }
    )
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Cannot set the status back to active here, as the hashes may have already changed.
  // So even when migrating down, the users should re-apply their passwords.
}
