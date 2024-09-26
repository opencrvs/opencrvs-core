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

import { resourceIdentifierToUUID } from '@opencrvs/commons/types'
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

  const relatedPersonDocuments = await db
    .collection('RelatedPerson')
    .find({ 'relationship.coding.code': 'PRINT_IN_ADVANCE' })
    .toArray()

  for (const relatedPerson of relatedPersonDocuments) {
    const patientRef = relatedPerson.patient.reference
    const patientId = resourceIdentifierToUUID(patientRef)
    await db.collection('Patient').deleteOne({ id: patientId })

    const docResource = db
      .collection('DocumentReference')
      .find({ 'extension.valueReference.reference': patientRef })

    await db.collection('DocumentReference').updateOne(
      { id: docResource.id },
      // we have to import the practitioner id here for that specific task
      { $set: { 'extension.valueReference.reference': '' } }
    )
  }
}

export const down = async (db: Db, client: MongoClient) => {}
