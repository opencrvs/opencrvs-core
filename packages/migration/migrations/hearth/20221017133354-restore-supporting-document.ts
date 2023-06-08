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
  getBirthEncounterCompositionCursor,
  getBirthEncounterCompositionCount
} from '../../utils/hearth-helper'
import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  const limit = 50
  let skip = 0
  let processedDocCount = 0
  try {
    await session.withTransaction(async () => {
      const totalCompositionCount = await getBirthEncounterCompositionCount(db)
      while (totalCompositionCount > processedDocCount) {
        const compositionCursor =
          await getBirthEncounterCompositionCursor<fhir.Composition>(
            db,
            limit,
            skip
          )
        const count = await compositionCursor.count()
        console.log(
          `Migration - SupportingDocuments :: Processing ${
            processedDocCount + 1
          } - ${
            processedDocCount + count
          } of ${totalCompositionCount} compositions...`
        )
        while (await compositionCursor.hasNext()) {
          const composition: any = await compositionCursor.next()
          const compositionHistory = await db
            .collection('Composition_history')
            .find({
              id: composition.id
            })
            .toArray()
          compositionHistory.push(composition)
          const correctionIndex = compositionHistory.findIndex((composition) =>
            composition.section.find(
              (section: any) =>
                section.code.coding[0].code === 'birth-correction-encounters'
            )
          )
          const immediatePrevComp = compositionHistory[correctionIndex - 1]
          const hasDocumentSection = immediatePrevComp?.section.find(
            (section: any) =>
              section.code.coding[0].code === 'supporting-documents'
          )
          if (hasDocumentSection) {
            await db
              .collection('Composition')
              .updateOne(
                { id: compositionHistory[correctionIndex].id },
                { $push: { section: hasDocumentSection } }
              )
          }
        }
        skip += limit
        processedDocCount += count
        const percentage = (
          (processedDocCount / totalCompositionCount) *
          100
        ).toFixed(2)
        console.log(
          `Migration - SupportingDocuments :: Processing done ${percentage}%`
        )
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
