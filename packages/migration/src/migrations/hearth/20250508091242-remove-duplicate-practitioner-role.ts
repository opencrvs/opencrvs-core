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

import { Db } from 'mongodb'

// Migration to remove redundant historical entries in PractitionerRole_history
// but also handles the case where a Practioner may change their role and change it back
// e.g. From Registrar to Registration Agent and back to Registrar

export const up = async (db: Db) => {
  const collection = db.collection('PractitionerRole_history')

  const docs = await collection
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
    .toArray()

  const toDelete: any[] = []

  let prevId: string | undefined
  let prevRole: string | undefined

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
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

  if (toDelete.length) {
    const result = await collection.deleteMany({ _id: { $in: toDelete } })
    console.log(`Deleted ${result.deletedCount} redundant historical entries.`)
  } else {
    console.log('No redundant entries found.')
  }
}

export const down = async () => {}
