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
      const compositionCursor = getCompositionCursor(db)
      while (await compositionCursor.hasNext()) {
        const composition = await compositionCursor.next()
        const compositionHistory = await db
          .collection('Composition_history')
          .find({
            id: composition.id
          })
          .toArray()
        compositionHistory.push(composition)
        const correctionIndex = compositionHistory.findIndex((composition) => {
          return composition.section.find(
            (section) =>
              section.code.coding[0].code === 'birth-correction-encounters'
          )
        })
        const immediatePrevComp = compositionHistory[correctionIndex - 1]
        const hasDocumentSection = immediatePrevComp.section.find(
          (section) => section.code.coding[0].code === 'supporting-documents'
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
    })
  } finally {
    await session.endSession()
  }
}

function getCompositionCursor(db) {
  return db.collection('Composition').find({
    'section.code.coding': { $elemMatch: { code: 'birth-encounter' } }
  })
}

export const down = async (db, client) => {}
