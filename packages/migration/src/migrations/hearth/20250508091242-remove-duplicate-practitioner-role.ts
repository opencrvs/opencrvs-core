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

// Migration to remove redundant historical entries in PractitionerRole_history
// but also handles the case where a Practioner may change their role and change it back
// e.g. From Registrar to Registration Agent and back to Registrar

export const up = async (db: Db, client: MongoClient) => {
  const collection = db.collection('PractitionerRole_history')
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const cursor = collection
        .find(
          {
            practitioner: { $exists: true },
            code: { $exists: true },
            'code.0.coding.0.code': { $exists: true },
            'meta.lastUpdated': { $exists: true }
          },
          {
            projection: {
              practitioner: 1,
              code: 1,
              meta: 1
            }
          }
        )
        .sort({ 'practitioner.reference': 1, 'meta.lastUpdated': 1 })

      const toDelete: any[] = []

      let prevId: string | undefined
      let prevRole: string | undefined

      while (await cursor.hasNext()) {
        const doc = await cursor.next()
        if (!doc) continue

        const practitionerId = doc.practitioner?.reference
        const role = doc.code?.[0]?.coding?.[0]?.code

        if (!practitionerId || !role) continue

        if (practitionerId !== prevId) {
          prevId = practitionerId
          prevRole = role
          continue
        }

        if (role === prevRole) {
          toDelete.push(doc._id)
        } else {
          prevRole = role
        }
      }
      const batches = createBatches(toDelete, 1000)

      for (const batch of batches) {
        await collection.deleteMany({ _id: { $in: batch } })
        console.log(`Deleted batch of ${batch.length} duplicates`)
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async () => {}

function createBatches<T>(array: T[], batchSize: number): T[][] {
  const result = []
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize))
  }
  return result
}
