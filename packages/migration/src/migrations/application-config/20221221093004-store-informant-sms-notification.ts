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
import {
  INFORMANT_SMS_NOTIFICATION_COLLECTION,
  getNotificationContent
} from '../../utils/resource-helper.js'
import { NotificationContent } from '../../utils/migration-interfaces.js'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  const notificationContentData: NotificationContent[] =
    getNotificationContent()
  try {
    await session.withTransaction(async () => {
      await db
        .collection(INFORMANT_SMS_NOTIFICATION_COLLECTION)
        .insertMany(notificationContentData)
    })
  } finally {
    console.log(`Migration - INFORMANT_SMS_NOTIFICATION : Done. `)
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection(INFORMANT_SMS_NOTIFICATION_COLLECTION).drop()
    })
  } finally {
    console.log(`Migration - DOWN - INFORMANT_SMS_NOTIFICATION - DONE `)
    await session.endSession()
  }
}
