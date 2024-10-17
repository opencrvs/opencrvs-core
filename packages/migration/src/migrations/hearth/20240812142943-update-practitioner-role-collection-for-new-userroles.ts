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

export const up = async (db: Db, client: MongoClient) => {
  const documents = await db
    .collection('PractitionerRole')
    .find({ 'code.coding.system': 'http://opencrvs.org/specs/types' })
    .toArray()

  for (const doc of documents) {
    const filteredCode = doc.code.filter((c: any) =>
      c.coding.find(
        (cod: any) => cod.system !== 'http://opencrvs.org/specs/types'
      )
    )

    await db
      .collection('PractitionerRole')
      .updateOne({ _id: doc._id }, { $set: { code: filteredCode } })
  }
  console.log('Documents updated.')
}

export const down = async (db: Db, client: MongoClient) => {}
