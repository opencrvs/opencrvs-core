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
    await session.withTransaction(async () => {
      // eslint-disable-next-line no-console
      console.log('Updating indices for collection: Task')
      await db.collection('Task').createIndex({ id: 1 })
      if (
        await db
          .collection('Task')
          .count({ 'focus.reference': { $exists: true } })
      ) {
        await db.collection('Task').createIndex({ 'focus.reference': 1 })
      }
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

export const down = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('Task').dropIndexes({ 'focus.reference': -1, id: -1 })
      await db.collection('Composition').dropIndex({ id: -1 })
      await db.collection('Location').dropIndex({ id: -1 })
      await db.collection('Encounter').dropIndex({ id: -1 })
      await db.collection('Observation').dropIndex({ id: -1 })
      await db.collection('DocumentReference').dropIndex({ id: -1 })
      await db.collection('Practitioner').dropIndex({ id: -1 })
      await db.collection('PractitionerRole').dropIndex({ id: -1 })
      await db.collection('RelatedPerson').dropIndex({ id: -1 })
      await db.collection('Patient').dropIndex({ id: -1 })
      await db.collection('PaymentReconciliation').dropIndex({ id: -1 })
    })
  } finally {
    await session.endSession()
  }
}
