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

import {
  COLLECTION_NAMES,
  getCollectionDocuments
} from '../../utils/hearth-helper.js'
import { Db, MongoClient } from 'mongodb'
import {
  updateComposition,
  searchCompositionByCriteria
  // eslint-disable-next-line import/no-relative-parent-imports
} from '../../utils/elasticsearch-helper.js'

// THIS MIGRATION POPULATES THE MISSING EVENTLOCATIONIDS OR EVENTJURISDICTIONS IDS DUE TO THE ISSUE - #5242

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  const limit = 10
  let processedDocCount = 0
  const searchCriteria = {
    bool: {
      must: [
        {
          terms: {
            type: ['issued', 'certified']
          }
        },
        {
          bool: {
            must_not: [
              {
                exists: {
                  field: 'eventLocationId'
                }
              },
              {
                exists: {
                  field: 'eventJurisdictionIds'
                }
              }
            ]
          }
        }
      ]
    }
  }

  const compositionsWithoutLocationIdsResult =
    await searchCompositionByCriteria(searchCriteria)
  const totalCompositionsWithoutLocationIds =
    compositionsWithoutLocationIdsResult?.body.hits.total.value || 0

  while (processedDocCount < totalCompositionsWithoutLocationIds) {
    const elasticDocBatchResult = await searchCompositionByCriteria(
      searchCriteria,
      { size: 10 }
    )
    const elasticDocBatch = elasticDocBatchResult?.body.hits.hits || []
    // eslint-disable-next-line no-console
    console.log(
      `Migration - ElasticSearch :: Processing ${processedDocCount + 1} - ${
        processedDocCount + limit
      } of ${totalCompositionsWithoutLocationIds} compositions...`
    )

    for (const elasticDoc of elasticDocBatch) {
      // populate the missing eventCountry and eventLocationId/eventJurisdictionIds for each doc
      try {
        await updateEventLocationIdOrJurisdictionIds(db, elasticDoc)
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(
          `Migration - ElasticSearch :: Process for populating missing eventLocationId/eventJurisdictionIds for ${elasticDoc.id} failed : ${error.stack}`
        )
      }
    }

    processedDocCount += limit
  }

  await session.endSession()
  // eslint-disable-next-line no-console
  console.log(
    `Migration - ElasticSearch :: Process for populating missing eventLocationId/eventJurisdictionIds  completed successfully.`
  )
}

export const down = async (db: Db, client: MongoClient) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}

async function updateEventLocationIdOrJurisdictionIds(db: Db, elasticDoc: any) {
  const body: Record<string, any> = {}
  const compositionId = elasticDoc._id
  const compositionFromDB = await getCollectionDocuments(
    db,
    COLLECTION_NAMES.COMPOSITION,
    [compositionId]
  )

  if (!compositionFromDB) {
    throw new Error(`could not find composition with id: ${compositionId}`)
  }

  const composition = compositionFromDB[0]
  const encounterSection = composition.section.find(
    (section: any) =>
      section.code?.coding?.[0]?.code === 'birth-encounter' ||
      section.code?.coding?.[0]?.code === 'death-encounter'
  )

  if (!encounterSection) {
    throw new Error(
      `could not find encounter in compositionID: ${compositionId}`
    )
  }
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
      if (locationDoc[0].type.coding[0].code === 'HEALTH_FACILITY') {
        body.eventLocationId = locationDoc[0].id
      } else {
        const address = locationDoc[0].address
        if (address) {
          const eventJurisdictionIds: string[] = []
          address.state && eventJurisdictionIds.push(address.state)
          address.district && eventJurisdictionIds.push(address.district)
          if (address.line) {
            address.line[10] && eventJurisdictionIds.push(address.line[10])
            address.line[11] && eventJurisdictionIds.push(address.line[11])
            address.line[12] && eventJurisdictionIds.push(address.line[12])
          }
          body.eventJurisdictionIds = eventJurisdictionIds
          body.eventCountry = address.country
        }
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(
        `No location found for locationId:${locationId} against encounter of compositionId:${composition.id}`
      )
    }
  }

  await updateComposition(composition.id, body, { refresh: 'wait_for' })
}
