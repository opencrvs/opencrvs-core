/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
graphic logo are (registered/a) trademark(s) of Plan International.
*/
exports.up = async (db, client) => {
  const session = client.startSession()
  try {
    const count = await db
      .collection('transactions')
      .find({
        'request.timestamp': {
          $lt: new Date(new Date() - 1000 * 60 * 60 * 720)
        }
      })
      .count()

    console.log('OLD OPENHIM TRANSACTIONS COUNT: ', count)

    if (count > 0) {
      // Delete all openhim-transactions older than 30 days in order to save disk space
      console.log('DELETING OLD OPENHIM TRANSACTIONS')
      await db.collection('transactions').remove({
        'request.timestamp': {
          $lt: new Date(new Date() - 1000 * 60 * 60 * 720)
        }
      })
      console.log('DELETED')
    }
  } finally {
    await session.endSession()
  }
}

exports.down = async (db, client) => {
  // No need to revert this migration
}
