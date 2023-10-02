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
  const identifierTypeSystem = 'http://opencrvs.org/specs/identifier-type'
  const EVENT_IDENTIFIER = [
    'BIRTH_REGISTRATION_NUMBER',
    'DEATH_REGISTRATION_NUMBER',
    'NATIONAL_ID',
    'MOSIP_PSUT_TOKEN_ID'
  ]
  const session = client.startSession()
  let processPatient = 0
  let processPatientHistory = 0

  try {
    await session.withTransaction(async () => {
      const patientWithRNIdentifier = await db.collection('Patient').find({
        'identifier.type': {
          $in: EVENT_IDENTIFIER
        }
      })

      const patientHistoryWithRNIdentifier = await db
        .collection('Patient_history')
        .find({
          'identifier.type': {
            $in: EVENT_IDENTIFIER
          }
        })

      const patientWithRNIdentifierCount =
        await getTotalAvailableDocCountByCollectionName(
          db,
          'Patient',
          'identifier.type'
        )

      const patientHistoryWithRNIdentifierCount =
        await getTotalAvailableDocCountByCollectionName(
          db,
          'Patient_history',
          'identifier.type'
        )

      // eslint-disable-next-line no-console
      console.log(
        `Migration - Patient identifier update with fhir Codeableconcept, total ${patientWithRNIdentifierCount} patient needs to be processed`
      )

      for await (const patient of patientWithRNIdentifier) {
        // eslint-disable-next-line no-console
        console.log(
          `Processed ${
            processPatient + 1
          }/${patientWithRNIdentifierCount} patient identifiter, progress ${(
            ((processPatient + 1) / patientWithRNIdentifierCount) *
            100
          ).toFixed(2)}% ...`
        )
        for (const identifier of patient.identifier) {
          if (EVENT_IDENTIFIER.includes(identifier.type)) {
            const updatedCoding = [
              {
                system: identifierTypeSystem,
                code: identifier.type
              }
            ]
            await db.collection('Patient').updateOne(
              {
                _id: patient._id,
                'identifier.type': {
                  $in: EVENT_IDENTIFIER
                }
              },
              {
                $set: {
                  'identifier.$[].type': {
                    coding: updatedCoding
                  }
                }
              }
            )
            processPatient++
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log(
        `Migration - Patient history identifier update with fhir Codeableconcept, total ${patientHistoryWithRNIdentifierCount} patient history needs to be processed`
      )

      for await (const patient of patientHistoryWithRNIdentifier) {
        // eslint-disable-next-line no-console
        console.log(
          `Processed ${
            processPatientHistory + 1
          }/${patientHistoryWithRNIdentifierCount} patient identifiter, progress ${(
            ((processPatientHistory + 1) /
              patientHistoryWithRNIdentifierCount) *
            100
          ).toFixed(2)}% ...`
        )
        for (const identifier of patient.identifier) {
          if (EVENT_IDENTIFIER.includes(identifier.type)) {
            const updatedCoding = [
              {
                system: identifierTypeSystem,
                code: identifier.type
              }
            ]
            await db.collection('Patient_history').updateOne(
              {
                _id: patient._id,
                'identifier.type': {
                  $in: EVENT_IDENTIFIER
                }
              },
              {
                $set: {
                  'identifier.$[].type': {
                    coding: updatedCoding
                  }
                }
              }
            )
            processPatientHistory++
          }
        }
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}

// count doucments by collection name with existing field
export async function getTotalAvailableDocCountByCollectionName(
  db: Db,
  collectionName: string,
  fieldToCheck: string
) {
  const filter = { [fieldToCheck]: { $exists: true } }
  return await db.collection(collectionName).countDocuments(filter)
}
