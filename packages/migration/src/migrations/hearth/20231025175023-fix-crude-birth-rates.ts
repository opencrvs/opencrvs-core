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
  const locationExtensionURL =
    'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
  const session = client.startSession()
  const processLocation = 0

  try {
    await session.withTransaction(async () => {
      const locations = await db.collection('Locations').find({})
      const locationsCount = await db.collection('Locations').countDocuments({})
      // eslint-disable-next-line no-console
      console.log(
        `Migration - Crude birth rates to be amended, total ${locationsCount} needs to be processed`
      )

      for await (const location of locations) {
        // eslint-disable-next-line no-console
        console.log(
          `Processed ${processLocation + 1}/${locationsCount} , progress ${(
            ((processLocation + 1) / locationsCount) *
            100
          ).toFixed(2)}% ...`
        )
        for (const extension of location.extension) {
          if (extension.url === locationExtensionURL) {
            const valuesArray = JSON.parse(extension.valueString)
            valuesArray.forEach(function (obj) {
              for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  const value = obj[key]
                  console.log('Key: ' + key + ', Value: ' + value)
                }
              }
            })
          }
          const updatedExtension = [
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

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}
