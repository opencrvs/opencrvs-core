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
import { InfluxDB, FieldType } from 'influx'

const INFLUX_HOST = process.env.INFLUX_HOST || 'localhost'
const INFLUX_PORT = process.env.INFLUX_PORT || 8086
const INFLUX_DB = process.env.INFLUX_DB || 'ocrvs'

export const up = async (db) => {
  const influx = new InfluxDB({
    host: INFLUX_HOST,
    database: INFLUX_DB,
    port: INFLUX_PORT,
    schema: [
      {
        measurement: 'declarations_rejected',
        fields: {
          compositionId: FieldType.STRING
        },
        tags: [
          'eventType',
          'startedBy',
          'officeLocation',
          'locationLevel5',
          'locationLevel4',
          'locationLevel3',
          'locationLevel2',
          'locationLevel1'
        ]
      }
    ]
  })

  const rejectedPoints = (
    await influx.query('SELECT * FROM declarations_rejected')
  ).map(({ time, ...point }) => ({
    ...point,
    timestamp: time.getNanoTime()
  }))

  const startedByMap = await getCompositionIdToStartedByMap(
    db,
    rejectedPoints.map(({ compositionId }) => compositionId)
  )

  const rejectedPointsWithCorrectStartedBy = rejectedPoints.map(
    ({ compositionId, timestamp, ...tags }) => ({
      measurement: 'declarations_rejected',
      tags: { ...tags, startedBy: startedByMap.get(compositionId) },
      fields: { compositionId },
      timestamp
    })
  )

  await influx.dropMeasurement('declarations_rejected')

  await influx.writePoints(rejectedPointsWithCorrectStartedBy)
}

async function getCompositionIdToStartedByMap(db, compositionIds) {
  const extractId = (reference) => reference.split('/')[1]
  const cursor = await getTaskCursor(db, compositionIds)
  const startedByMap = new Map()
  await cursor.forEach((task) => {
    const compositionId = extractId(task.focus.reference)
    if (startedByMap.has(compositionId)) return
    startedByMap.set(
      compositionId,
      extractId(task.extension[0].valueReference.reference)
    )
  })
  return startedByMap
}

function getTaskCursor(db, compositionIds) {
  const query = {
    $match: {
      'businessStatus.coding.code': {
        $in: ['IN_PROGRESS', 'DECLARED', 'VALIDATED']
      },
      'focus.reference': {
        $in: compositionIds.map(
          (compositionId) => `Composition/${compositionId}`
        )
      }
    }
  }
  const projection = {
    $project: {
      'focus.reference': 1,
      extension: {
        $filter: {
          input: '$extension',
          as: 'ext',
          cond: {
            $eq: [
              '$$ext.url',
              'http://opencrvs.org/specs/extension/regLastUser'
            ]
          }
        }
      },
      meta: 1,
      _id: 0
    }
  }
  const sort = { $sort: { 'meta.lastUpdated': 1 } }
  return db.collection('Task_history').aggregate([query, projection, sort])
}

export const down = async () => {}
