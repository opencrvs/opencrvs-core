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

function stripBucketPrefix(path: string): string {
  return path.startsWith('/ocrvs/') ? path.replace('/ocrvs/', '') : path
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const practitioners = db.collection('Practitioner').find({
        'extension.valueAttachment.url': { $regex: '^/ocrvs/' }
      })

      for await (const practitioner of practitioners) {
        const update: Record<string, any> = {}

        if (Array.isArray(practitioner.extension)) {
          practitioner.extension.forEach((ext: any, idx: number) => {
            const url = ext?.valueAttachment?.url
            if (url?.startsWith('/ocrvs/')) {
              update[`extension.${idx}.valueAttachment.url`] =
                stripBucketPrefix(url)
            }
          })
        }

        if (Object.keys(update).length > 0) {
          await db
            .collection('Practitioner')
            .updateOne({ _id: practitioner._id }, { $set: update }, { session })
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (_db: Db, _client: MongoClient) => {
  // no-op: cannot restore "/ocrvs/" bucket prefix reliably
}
