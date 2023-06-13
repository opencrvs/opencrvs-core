/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { Db, MongoClient } from 'mongodb'
import {
  INFORMANT_SMS_NOTIFICATION_COLLECTION,
  getNotificationContent
} from '@migration/utils/resource-helper'
import { NotificationContent } from '@migration/utils/migration-interfaces'

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
