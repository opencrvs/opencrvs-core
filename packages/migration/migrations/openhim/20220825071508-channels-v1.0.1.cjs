/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration 
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS 
graphic logo are (registered/a) trademark(s) of Plan International.
*/
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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./openhim-base-config-v1.0.1.json')

exports.up = async (db, client) => {
  const session = client.startSession()
  try {
    const channels = baseConfig.Channels
    await session.withTransaction(async () => {
      for (const channel of channels) {
        await db.collection('channels').updateMany(
          { name: channel.name },
          { $set: channel },
          {
            upsert: true,
            session
          }
        )
      }
    })
  } finally {
    await session.endSession()
  }
}

exports.down = async (db, client) => {
  await db.collection('channels').remove({})
}
