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
  const userManagementClient = new MongoClient(USER_MGNT_MONGO_URL)
  const userMgntDb = (await userManagementClient.connect()).db()

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

  const relatedPersons = await db.collection('RelatedPerson').find().toArray()

  for (const person of relatedPersons) {
    const relationship = person.relationship.coding[0].code
    if (relationship === 'PRINT_IN_ADVANCE') {
      const userRole = person.relationship.text
      const formattedUserRole = userRole.toUpperCase().replace(' ', '_')

      const userRoleId = userMgntDb.collection('users').find({
        role: formattedUserRole
      })

      await db
        .collection('RelatedPerson')
        .updateOne(
          { _id: person._id },
          { $set: { 'resource.relationship.text': userRoleId } }
        )
    }
  }
}

export const down = async (db: Db, client: MongoClient) => {}
