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
import fs from 'fs'
const baseConfig = JSON.parse(
  fs.readFileSync('./openhim-base-config-v1.0.1.json', 'utf-8')
)

export async function up(db: Db, client: MongoClient) {
  const session = client.startSession()
  try {
    const channels = baseConfig.Channels
    await session.withTransaction(async () => {
      for (const channel of channels) {
        await db.collection('channels').updateMany(
          { name: channel.name },
          { $set: channel },
          {
            upsert: true
          }
        )
      }
    })
  } finally {
    await session.endSession()
  }
}

export async function down(db: Db, client: MongoClient) {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('channels').deleteMany({})
    })
  } finally {
    await session.endSession()
  }
}
