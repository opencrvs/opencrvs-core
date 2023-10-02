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

import {
  isBase64FileString,
  uploadBase64ToMinio
  // eslint-disable-next-line import/no-relative-parent-imports
} from '../../utils/minio-helper.js'
import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  const limit = 10
  let skip = 0
  let processedDocCount = 0
  try {
    await session.withTransaction(async () => {
      const totalCompositionCount = await getTotalDocCountByCollectionName(
        db,
        'DocumentReference'
      )
      while (totalCompositionCount > processedDocCount) {
        const documentCursor = await getDocumentReferenceCursor(db, limit, skip)
        const count = await documentCursor.count()
        // eslint-disable-next-line no-console
        console.log(
          `Migration - Minio :: Processing ${processedDocCount + 1} - ${
            processedDocCount + count
          } of ${totalCompositionCount} documents...`
        )
        while (await documentCursor.hasNext()) {
          const document = await documentCursor.next()
          const fileData = document?.content[0].attachment.data
          if (fileData && isBase64FileString(fileData)) {
            const refUrl = await uploadBase64ToMinio(fileData)
            if (refUrl) {
              await db
                .collection('DocumentReference')
                .updateOne(
                  { id: document.id },
                  { $set: { 'content.0.attachment.data': refUrl } }
                )
            }
          }
        }
        skip += limit
        processedDocCount += count
        const percentage = (
          (processedDocCount / totalCompositionCount) *
          100
        ).toFixed(2)
        // eslint-disable-next-line no-console
        console.log(`Migration - Minio :: Processing done ${percentage}%`)
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}

export async function getDocumentReferenceCursor(db: Db, limit = 50, skip = 0) {
  return db.collection('DocumentReference').find({}, { limit, skip })
}

export async function getTotalDocCountByCollectionName(
  db: Db,
  collectionName: string
) {
  return await db.collection(collectionName).count()
}
