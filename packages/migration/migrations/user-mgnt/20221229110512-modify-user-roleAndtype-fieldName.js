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
    const users = await db
      .collection('users')
      .find({ role: { $ne: 'FIELD_AGENT' } })
      .toArray()
    if (users && users.length) {
      await Promise.all(
        users.map(async (user) => {
          await db
            .collection('users')
            .updateOne(
              { username: user.username },
              { $set: { type: user.role } }
            )
        })
      )
    }

    await db
      .collection('users')
      .updateMany({}, { $rename: { role: 'systemRole' } })
    await db.collection('users').updateMany({}, { $rename: { type: 'role' } })
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {
  const session = client.startSession()
  try {
    await db.collection('users').updateMany({}, { $rename: { role: 'type' } })
    await db
      .collection('users')
      .updateMany({}, { $rename: { systemRole: 'role' } })

    const users = await db
      .collection('users')
      .find({ role: { $ne: 'FIELD_AGENT' } })
      .toArray()
    if (users && users.length) {
      await Promise.all(
        users.map(async (user) => {
          await db
            .collection('users')
            .updateOne({ username: user.username }, { $set: { type: '' } })
        })
      )
    }
  } finally {
    await session.endSession()
  }
}
