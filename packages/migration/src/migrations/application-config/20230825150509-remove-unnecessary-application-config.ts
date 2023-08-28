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

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const document = await db.collection('configs').findOne({})

      if (document) {
        await db.collection('configs').updateMany(
          {},
          {
            $unset: {
              DATE_OF_BIRTH_UNKNOWN: '',
              DECLARATION_AUDIT_LOCATIONS: '',
              EXTERNAL_VALIDATION_WORKQUEUE: '',
              FIELD_AGENT_AUDIT_LOCATIONS: '',
              INFORMANT_SIGNATURE: '',
              INFORMANT_SIGNATURE_REQUIRED: '',
              MARRIAGE_REGISTRATION: '',
              INFORMANT_NOTIFICATION_DELIVERY_METHOD: '',
              USER_NOTIFICATION_DELIVERY_METHOD: ''
            }
          }
        )
      }
    })
  } finally {
    console.log(
      `Migration - Remove application config fields which can't be updated from UI: Done.`
    )
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
