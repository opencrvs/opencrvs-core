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

const USER_MGNT_MONGO_URL =
  process.env.USER_MGNT_MONGO_URL || 'mongodb://localhost/user-mgnt'

export const up = async (db: Db, client: MongoClient) => {
  const userMgntDb = (await new MongoClient(USER_MGNT_MONGO_URL).connect()).db()

  const practitioners = db.collection('Practitioner').find({})

  for await (const practitioner of practitioners) {
    const user = await userMgntDb
      .collection('users')
      .findOne({ practitionerId: practitioner.id })

    if (user && user.emailForNotification) {
      await db.collection('Practitioner').updateOne(
        { _id: practitioner._id, 'telecom.system': 'email' },
        {
          $set: {
            'telecom.$[elem].value': user.emailForNotification
          }
        },
        {
          arrayFilters: [{ 'elem.system': 'email' }]
        }
      )
    }
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}
