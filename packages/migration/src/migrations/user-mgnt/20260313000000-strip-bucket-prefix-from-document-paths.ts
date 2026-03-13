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

/**
 * Strips the bucket prefix from a FullDocumentPath.
 * "/ocrvs/event-id/file.png" -> "event-id/file.png"
 * "/ocrvs/file.png" -> "file.png"
 */
function stripBucketPrefix(path: string): string {
  return path.replace(/^\/[^/]+\//, '')
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const users = db.collection('users').find({
        $or: [
          { 'avatar.data': { $regex: '^/' } },
          { 'signature.data': { $regex: '^/' } }
        ]
      })

      for await (const user of users) {
        const update: Record<string, string> = {}

        if (user.avatar?.data?.startsWith('/')) {
          update['avatar.data'] = stripBucketPrefix(user.avatar.data)
        }

        if (user.signature?.data?.startsWith('/')) {
          update['signature.data'] = stripBucketPrefix(user.signature.data)
        }

        if (Object.keys(update).length > 0) {
          await db
            .collection('users')
            .updateOne({ _id: user._id }, { $set: update }, { session })
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
