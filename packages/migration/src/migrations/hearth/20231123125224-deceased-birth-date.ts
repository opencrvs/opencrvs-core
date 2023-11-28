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
import { subYears, format } from 'date-fns'
import { Db, MongoClient } from 'mongodb'
import { updateComposition } from '../../utils/elasticsearch-helper.js'
import { reportProgress } from '../../utils/progressTracker.js'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    const ageExtension =
      'http://opencrvs.org/specs/extension/age-of-individual-in-years'

    const filter = {
      deceasedDateTime: { $ne: null },
      'extension.url': ageExtension
    }

    await session.withTransaction(async () => {
      const totalPatients = await db
        .collection('Patient')
        .countDocuments(filter)
      const patientIterator = db
        .collection('Patient')
        .find(filter)
        .project<{
          id: string
          deceasedDateTime: string
          extension: Array<{ url: string; valueString: string }>
        }>({
          id: 1,
          deceasedDateTime: 1,
          extension: {
            $filter: {
              input: '$extension',
              as: 'extension',
              cond: {
                $eq: ['$$extension.url', ageExtension]
              }
            }
          }
        })
      let processed = 0
      for await (const patient of patientIterator) {
        const age = parseInt(patient.extension[0].valueString, 10)
        const birthDate = subYears(new Date(patient.deceasedDateTime), age)
        db.collection('Patient').updateOne(
          { id: patient.id },
          { $set: { birthDate: format(birthDate, 'yyyy-MM-dd') } }
        )
        processed += 1

        reportProgress(
          'Deceased birth date migration',
          processed,
          totalPatients
        )

        const composition = await db
          .collection('Composition')
          .findOne<{ id: string }>(
            {
              'section.entry.reference': `Patient/${patient.id}`
            },
            { projection: { id: 1 } }
          )
        if (!composition) {
          console.log(
            `Composition corresponding to the patient "${patient.id}" not found. Skipping search data migration`
          )
          continue
        }
        await updateComposition(composition.id, {
          deceasedDoB: format(birthDate, 'yyyy-MM-dd')
        })
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}
