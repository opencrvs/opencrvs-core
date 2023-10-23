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
  let processUser = 0

  try {
    await session.withTransaction(async () => {
      const userWithAvatar = await db.collection('users').find({
        avatar: {
          $exists: true
        }
      })

      const userWithAvatarCount =
        await getTotalUserWithAvatarCountByCollectionName(db, 'users', 'avatar')

      // eslint-disable-next-line no-console
      console.log(
        `Migration - Upadate user avatar with minio, total ${userWithAvatarCount} user needs to be processed`
      )

      for await (const user of userWithAvatar) {
        // eslint-disable-next-line no-console
        console.log(
          `Processed ${
            processUser + 1
          }/${userWithAvatarCount} user, progress ${(
            ((processUser + 1) / userWithAvatarCount) *
            100
          ).toFixed(2)}% ...`
        )
        const fileData = user?.avatar?.data
        if (fileData && isBase64FileString(fileData)) {
          const refUrl = await uploadBase64ToMinio(fileData)
          if (refUrl) {
            await db
              .collection('users')
              .updateOne({ _id: user._id }, { $set: { 'avatar.data': refUrl } })
          }
          processUser++
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}

export async function getTotalUserWithAvatarCountByCollectionName(
  db: Db,
  collectionName: string,
  fieldToCheck: string
) {
  const filter = { [fieldToCheck]: { $exists: true } }
  return await db.collection(collectionName).countDocuments(filter)
}
