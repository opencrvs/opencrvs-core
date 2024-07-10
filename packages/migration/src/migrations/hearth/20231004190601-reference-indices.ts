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
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('PractitionerRole')
        .createIndex({ 'practitioner.reference': 1 })
      await db
        .collection('DocumentReference')
        .createIndex({ 'subject.reference': 1 })
      await db.collection('Observation').createIndex({ 'context.reference': 1 })
      await db.collection('Task_history').createIndex({ id: 1 })
      await db.collection('Composition_history').createIndex({ id: 1 })
      await db.collection('Encounter_history').createIndex({ id: 1 })
      await db.collection('PractitionerRole_history').createIndex({ id: 1 })
      await db.collection('Task').createIndex({ 'focus.reference': 1 })
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db
        .collection('PractitionerRole')
        .dropIndex('practitioner.reference')
      await db.collection('DocumentReference').dropIndex('subject.reference')
      await db.collection('Observation').dropIndex('context.reference')
      await db.collection('Task_history').dropIndex('id')
      await db.collection('Composition_history').dropIndex('id')
      await db.collection('Encounter_history').dropIndex('id')
      await db.collection('PractitionerRole_history').dropIndex('id')
      await db.collection('Task').dropIndex('focus.reference')
    })
  } catch (error) {
    console.error('Error occurred while dropping the index:', error)
  } finally {
    await session.endSession()
  }
}
