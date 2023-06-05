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
import { MongoClient } from 'mongodb'
import * as mongoose from 'mongoose'

const USER_MGNT_MONGO_URL =
  process.env.USER_MGNT_MONGO_URL || 'mongodb://localhost/user-mgnt'

export const up = async (db, client) => {
  const ObjectId = mongoose.Types.ObjectId
  const session = client.startSession()
  const userManagementClient = new MongoClient(USER_MGNT_MONGO_URL)
  const connectedUserManagementClient = await userManagementClient.connect()
  const systemsCollection = connectedUserManagementClient
    .db()
    .collection('systems')

  const systemIdentifier = 'http://opencrvs.org/specs/id/system_identifier'

  try {
    await session.withTransaction(async () => {
      const tasksWithSystem = await db
        .collection('Task')
        .find({
          'identifier.system': systemIdentifier
        })
        .toArray()

      const tasksHistoryWithSystem = await db
        .collection('Task_history')
        .find({
          'identifier.system': systemIdentifier
        })
        .toArray()

      // Task update with system identifier value
      // eslint-disable-next-line no-console
      console.log(
        `Migration - Update task integration with system object :: Processing total ${tasksWithSystem.length} tasks...`
      )
      for await (const task of tasksWithSystem) {
        for await (const identifier of task.identifier) {
          if (identifier.system === systemIdentifier) {
            const system = await systemsCollection.findOne({
              _id: ObjectId(identifier.value)
            })
            if (system) {
              await db.collection('Task').updateOne(
                { _id: task._id, 'identifier.value': identifier.value },
                {
                  $set: {
                    'identifier.$.value': JSON.stringify({
                      name: system.name,
                      username: system.username,
                      type: system.type
                    })
                  }
                }
              )
            }
          }
        }
      }
      // Task history update with system identifier value
      // eslint-disable-next-line no-console
      console.log(
        `Migration - Update Task history integration with system object :: Processing total ${tasksHistoryWithSystem.length} tasks...`
      )
      for await (const task of tasksHistoryWithSystem) {
        for await (const identifier of task.identifier) {
          if (identifier.system === systemIdentifier) {
            const system = await systemsCollection.findOne({
              _id: ObjectId(identifier.value)
            })
            if (system) {
              await db.collection('Task_history').updateOne(
                { _id: task._id, 'identifier.value': identifier.value },
                {
                  $set: {
                    'identifier.$.value': JSON.stringify({
                      name: system.name,
                      username: system.username,
                      type: system.type
                    })
                  }
                }
              )
            }
          }
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {}
