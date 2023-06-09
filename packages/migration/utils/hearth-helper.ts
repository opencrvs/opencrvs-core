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

import { Db, Document } from 'mongodb'

export const COLLECTION_NAMES = {
  COMPOSITION: 'Composition',
  ENCOUNTER: 'Encounter',
  LOCATION: 'Location',
  OBSERVATION: 'Observation',
  PATIENT: 'Patient',
  RELATEDPERSON: 'RelatedPerson',
  TASK: 'Task'
}

export async function getBirthEncounterCompositionCursor<T extends Document>(
  db: Db,
  limit = 50,
  skip = 0
) {
  return db.collection<Document>(COLLECTION_NAMES.COMPOSITION).find<T>(
    {
      'section.code.coding': { $elemMatch: { code: 'birth-encounter' } }
    },
    { limit, skip }
  )
}

export async function getBirthEncounterCompositionCount(db: Db) {
  return db
    .collection(COLLECTION_NAMES.COMPOSITION)
    .find({
      'section.code.coding': { $elemMatch: { code: 'birth-encounter' } }
    })
    .count()
}

export async function getCompositionCursor(db: Db, limit = 50, skip = 0) {
  return db.collection(COLLECTION_NAMES.COMPOSITION).find({}, { limit, skip })
}

export async function getCertifiedTaskCursor<T extends Document>(
  db: Db,
  limit = 50,
  skip = 0
) {
  return db
    .collection(COLLECTION_NAMES.TASK)
    .find<T>({ 'businessStatus.coding.code': 'CERTIFIED' }, { limit, skip })
}

export async function getTotalCertifiedTaskCount(db: Db) {
  return db
    .collection(COLLECTION_NAMES.TASK)
    .find({ 'businessStatus.coding.code': 'CERTIFIED' })
    .count()
}

export async function getTotalDocCountByCollectionName(
  db: Db,
  collectionName: string
) {
  return await db.collection(collectionName).count()
}

export async function getCollectionDocuments(
  db: Db,
  collectionName: string,
  ids: string[]
) {
  if (ids.length > 0) {
    return await db
      .collection(collectionName)
      .find({
        id: { $in: ids }
      })
      .toArray()
  } else {
    return await db.collection(collectionName).find().toArray()
  }
}
