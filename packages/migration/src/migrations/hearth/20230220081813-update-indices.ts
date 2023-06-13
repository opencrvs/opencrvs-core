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
import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      console.log('Updating indices for collection: Task')
      await db.collection('Task').createIndex({ id: 1 })
      if (
        await db
          .collection('Task')
          .count({ 'focus.reference': { $exists: true } })
      )
        // eslint-disable-next-line no-console
        console.log('Done updating indices for collection: Task')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Composition')
      await db.collection('Composition').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: Composition')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Location')
      await db.collection('Location').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: Location')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Encounter')
      await db.collection('Encounter').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: Encounter')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Observation')
      await db.collection('Observation').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: Observation')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: DocumentReference')
      await db.collection('DocumentReference').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: DocumentReference')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Practitioner')
      await db.collection('Practitioner').createIndex({ id: 1 }) // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: Practitioner')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: PractitionerRole')
      await db.collection('PractitionerRole').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: PractitionerRole')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: RelatedPerson')
      await db.collection('RelatedPerson').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: RelatedPerson')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Patient')
      await db.collection('Patient').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: Patient')

      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: PaymentReconciliation')
      await db.collection('PaymentReconciliation').createIndex({ id: 1 })
      // eslint-disable-next-line no-console
      console.log('Done updating indices for collection: PaymentReconciliation')
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('Task').dropIndex('focus.reference')
      await db.collection('Task').dropIndex('id')
      await db.collection('Composition').dropIndex('id')
      await db.collection('Location').dropIndex('id')
      await db.collection('Encounter').dropIndex('id')
      await db.collection('Observation').dropIndex('id')
      await db.collection('DocumentReference').dropIndex('id')
      await db.collection('Practitioner').dropIndex('id')
      await db.collection('PractitionerRole').dropIndex('id')
      await db.collection('RelatedPerson').dropIndex('id')
      await db.collection('Patient').dropIndex('id')
      await db.collection('PaymentReconciliation').dropIndex('id')
    })
  } finally {
    await session.endSession()
  }
}
