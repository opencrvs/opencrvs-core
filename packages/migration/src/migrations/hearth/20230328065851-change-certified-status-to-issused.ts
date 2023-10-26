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
  getCertifiedTaskCursor,
  getTotalCertifiedTaskCount
} from '../../utils/hearth-helper.js'
import {
  updateComposition,
  searchByCompositionId
} from '../../utils/elasticsearch-helper.js'
import uuidPkg from 'uuid'
import { Db, MongoClient } from 'mongodb'

const { v4: uuid } = uuidPkg

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  const limit = 10
  let processedDocCount = 0
  try {
    await session.withTransaction(async () => {
      const totalCertifiedTaskCount = await getTotalCertifiedTaskCount(db)
      while (totalCertifiedTaskCount > processedDocCount) {
        const taskCursor = await getCertifiedTaskCursor(db, limit)
        const count = await taskCursor.count()
        console.log(
          `Migration - Change Certified Status to Issued :: Processing ${
            processedDocCount + 1
          } - ${
            processedDocCount + count
          } of ${totalCertifiedTaskCount} compositions...`
        )
        while (await taskCursor.hasNext()) {
          const body: any = {}
          const { _id, ...taskDoc } =
            (await taskCursor.next()) as unknown as fhir.Task
          if (taskDoc) {
            await db.collection('Task').updateOne(
              { id: taskDoc.id },
              {
                $set: {
                  'businessStatus.coding.0.code': 'ISSUED'
                }
              }
            )
            await db.collection('Task_history').insertOne({
              ...taskDoc,
              meta: {
                ...taskDoc.meta,
                versionId: uuid()
              }
            })

            const compositionId =
              taskDoc.focus?.reference?.replace('Composition/', '') || ''
            const searchResult = await searchByCompositionId(compositionId)
            const operationHistoriesData =
              searchResult &&
              searchResult.body.hits.hits.length > 0 &&
              searchResult.body.hits.hits[0]._source?.operationHistories
            const lastOperationHistory =
              operationHistoriesData &&
              operationHistoriesData.length > 0 &&
              operationHistoriesData[operationHistoriesData.length - 1]

            body.operationHistories = operationHistoriesData || []
            body.operationHistories.push({
              ...lastOperationHistory,
              operatedOn: new Date().toISOString(),
              operationType: 'ISSUED'
            })
            body.type = 'ISSUED'
            await updateComposition(compositionId, body)
          }
        }
        processedDocCount += count
        const percentage = (
          (processedDocCount / totalCertifiedTaskCount) *
          100
        ).toFixed(2)
        console.log(
          `Migration - Change Certified Status to Issued :: Processing done ${percentage}%`
        )
      }
    })
  } finally {
    console.log(
      `Migration - Change Certified Status to Issued :: Process completed successfully.`
    )
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
