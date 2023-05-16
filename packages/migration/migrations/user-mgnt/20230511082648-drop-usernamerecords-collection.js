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
export const up = async (db, client) => {
  const session = client.startSession()

  try {
    const collections = await db.listCollections().toArray()
    const collectionExists = collections.some(
      (collection) => collection.name === 'usernamerecords'
    )
    if (collectionExists) {
      await db.dropCollection('usernamerecords')
      console.log(`UsernameRecord collection dropped`)
    } else {
      console.log(`UsernameRecord collection does not exist`)
    }
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {}
