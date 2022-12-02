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

import {
  COLLECTION_NAMES,
  getCompositionCursor,
  getCollectionDocuments,
  getTotalDocCountByCollectionName
} from '../../utils/hearth-helper.js'

import {
  updateComposition,
  updateFieldNameByCompositionId
} from '../../utils/elasticsearch-helper.js'

export const up = async (db, client) => {
  const session = client.startSession()
  const limit = 10
  let skip = 0
  let processedDocCount = 0
  try {
    await session.withTransaction(async () => {
      //rename field name declarationLocationHirarchyIds to declarationJurisdictionIds on elasticSearch
      await updateFieldNameByCompositionId(
        'declarationJurisdictionIds',
        'declarationLocationHirarchyIds'
      )
      const totalCompositionCount = await getTotalDocCountByCollectionName(
        db,
        COLLECTION_NAMES.COMPOSITION
      )

      while (totalCompositionCount > processedDocCount) {
        const compositionCursor = await getCompositionCursor(db, limit, skip)
        const count = await compositionCursor.count()
        // eslint-disable-next-line no-console
        console.log(
          `Migration - ElasticSearch :: Processing ${processedDocCount + 1} - ${
            processedDocCount + count
          } of ${totalCompositionCount} compositions...`
        )
        while (await compositionCursor.hasNext()) {
          const body = {}
          const compositionDoc = await compositionCursor.next()
          await setInformantDeceasedAndLocationDetails(db, body, compositionDoc)
        }
        skip += limit
        processedDocCount += count
        const percentage = (
          (processedDocCount / totalCompositionCount) *
          100
        ).toFixed(2)
        // eslint-disable-next-line no-console
        console.log(
          `Migration - ElasticSearch :: Processing done ${percentage}%`
        )
      }
    })
  } finally {
    // eslint-disable-next-line no-console
    console.log(`Migration - ElasticSearch :: Process completed successfully.`)
    await session.endSession()
  }
}

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}

async function setInformantDeceasedAndLocationDetails(db, body, composition) {
  const informantSection = composition.section.find(
    (section) => section.code.coding[0].code === 'informant-details'
  )
  const deceasedSection = composition.section.find(
    (section) => section.code.coding[0].code === 'deceased-details'
  )
  const encounterSection = composition.section.find(
    (section) =>
      section.code.coding[0].code === 'birth-encounter' ||
      section.code.coding[0].code === 'death-encounter'
  )

  if (informantSection) {
    const relatedPersonId = informantSection.entry[0]?.reference.replace(
      'RelatedPerson/',
      ''
    )
    const relatedPersonDoc = await getCollectionDocuments(
      db,
      COLLECTION_NAMES.RELATEDPERSON,
      [relatedPersonId]
    )
    if (relatedPersonDoc.length > 0) {
      const patientId = relatedPersonDoc[0].patient?.reference.replace(
        'Patient/',
        ''
      )
      const patientDoc = await getCollectionDocuments(
        db,
        COLLECTION_NAMES.PATIENT,
        [patientId]
      )
      if (patientDoc.length > 0) {
        body.informantDoB = patientDoc[0].birthDate
        body.informantIdentifier =
          patientDoc[0].identifier &&
          patientDoc[0].identifier.find(
            (identify) => identify.type === 'NATIONAL_ID'
          ).value
      }
    }
  }

  if (deceasedSection) {
    const patientId = deceasedSection.entry[0]?.reference.replace(
      'Patient/',
      ''
    )
    const patientDoc = await getCollectionDocuments(
      db,
      COLLECTION_NAMES.PATIENT,
      [patientId]
    )
    if (patientDoc.length > 0) {
      body.gender = patientDoc[0].gender
      body.deceasedDoB = patientDoc[0].birthDate
      body.deceasedIdentifier =
        patientDoc[0].identifier &&
        patientDoc[0].identifier.find(
          (identify) => identify.type === 'NATIONAL_ID'
        ).value
    }
  }

  if (encounterSection) {
    const encounterId = encounterSection.entry[0]?.reference.replace(
      'Encounter/',
      ''
    )

    const encounterDoc = await getCollectionDocuments(
      db,
      COLLECTION_NAMES.ENCOUNTER,
      [encounterId]
    )

    if (encounterDoc.length > 0) {
      const locationId = encounterDoc[0].location[0].location.reference.replace(
        'Location/',
        ''
      )

      const locationDoc = await getCollectionDocuments(
        db,
        COLLECTION_NAMES.LOCATION,
        [locationId]
      )
      if (locationDoc.length > 0) {
        const address = locationDoc[0].address
        if (address) {
          body.eventCountry = address.country
          const eventJurisdictionIds = []
          address.state && eventJurisdictionIds.push(address.state)
          address.district && eventJurisdictionIds.push(address.district)
          body.eventJurisdictionIds = eventJurisdictionIds
        }
      }
    }
  }
  await updateComposition(composition.id, body)
}
