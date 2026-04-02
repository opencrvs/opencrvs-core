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
import { MINIO_BUCKET } from '../../utils/minio-helper.js'

function stripBucketPrefix(path: string): string {
  const prefix = `/${MINIO_BUCKET}/`
  return path.startsWith(prefix) ? path.replace(prefix, '') : path
}

export const up = async (db: Db, _client: MongoClient) => {
  const prefix = `/${MINIO_BUCKET}/`

  const practitioners = db.collection('Practitioner').find({
    'extension.valueAttachment.url': { $regex: `^${prefix}` }
  })

  for await (const practitioner of practitioners) {
    const update: Record<string, any> = {}

    if (Array.isArray(practitioner.extension)) {
      practitioner.extension.forEach((ext: any, idx: number) => {
        const url = ext?.valueAttachment?.url
        if (url?.startsWith(prefix)) {
          update[`extension.${idx}.valueAttachment.url`] =
            stripBucketPrefix(url)
        }
      })
    }

    if (Object.keys(update).length > 0) {
      await db
        .collection('Practitioner')
        .updateOne({ _id: practitioner._id }, { $set: update })
    }
  }
}

export const down = async (_db: Db, _client: MongoClient) => {
  // no-op:
}
