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
  const identifierTypeSystem = 'http://opencrvs.org/specs/identifier-type'
  const EVENT_IDENTIFIER = [
    'BIRTH_REGISTRATION_NUMBER',
    'DEATH_REGISTRATION_NUMBER',
    'MARRIAGE_REGISTRATION_NUMBER',
    'NATIONAL_ID',
    'MOSIP_PSUT_TOKEN_ID'
  ]
  const session = client.startSession()
  let processPatient = 0
  let processPatientHistory = 0

  try {
    await session.withTransaction(async () => {
      const patientWithRNIdentifier = await db
        .collection('Patient')
        .find({
          'identifier.type': {
            $in: EVENT_IDENTIFIER
          }
        })
        .toArray()

      const patientHistoryWithRNIdentifier = await db
        .collection('Patient_history')
        .find({
          'identifier.type': {
            $in: EVENT_IDENTIFIER
          }
        })
        .toArray()

      // eslint-disable-next-line no-console
      console.log(
        `Migration - Patient identifier update with fhir Codeableconcept, total ${patientWithRNIdentifier.length} patient needs to be processed`
      )

      for await (const patient of patientWithRNIdentifier) {
        // eslint-disable-next-line no-console
        console.log(
          `Processed ${processPatient + 1}/${
            patientWithRNIdentifier.length
          } patient identifiter, progress ${(
            ((processPatient + 1) / patientWithRNIdentifier.length) *
            100
          ).toFixed(2)} ...`
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
              { _id: patient._id },
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
        `Migration - Patient history identifier update with fhir Codeableconcept, total ${patientHistoryWithRNIdentifier.length} patient history needs to be processed`
      )

      for await (const patient of patientHistoryWithRNIdentifier) {
        // eslint-disable-next-line no-console
        console.log(
          `Processed ${processPatientHistory + 1}/${
            patientHistoryWithRNIdentifier.length
          } patient identifiter, progress ${(
            ((processPatientHistory + 1) /
              patientHistoryWithRNIdentifier.length) *
            100
          ).toFixed(2)} ...`
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
              { _id: patient._id },
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

export const down = async (db, client) => {}
