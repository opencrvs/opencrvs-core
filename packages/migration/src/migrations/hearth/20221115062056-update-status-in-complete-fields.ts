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
import { Db } from 'mongodb'
import { FieldType, InfluxDB } from 'influx'
import { IPoints } from '../../utils/migration-interfaces.js'

const INFLUX_HOST = process.env.INFLUX_HOST || 'localhost'
const INFLUX_PORT = process.env.INFLUX_PORT || '8086'
const INFLUX_DB = process.env.INFLUX_DB || 'ocrvs'

export const up = async (db: Db) => {
  const influx = new InfluxDB({
    host: INFLUX_HOST,
    database: INFLUX_DB,
    port: parseInt(INFLUX_PORT),
    schema: [
      {
        measurement: 'in_complete_fields',
        fields: {
          compositionId: FieldType.STRING
        },
        tags: [
          'regStatus',
          'eventType',
          'locationLevel5',
          'locationLevel4',
          'locationLevel3',
          'locationLevel2',
          'locationLevel1',
          'missingFieldGroupId',
          'missingFieldId',
          'missingFieldSectionId'
        ]
      }
    ]
  })

  const previousPoints = (
    await influx.query(
      "SELECT * from in_complete_fields WHERE regStatus='IN_PROGESS'"
    )
  ).map(({ time, ...point }: any) => ({
    ...point,
    timestamp: time.getNanoTime()
  })) as IPoints[]

  const updatePoints = previousPoints.map(
    ({ compositionId, timestamp, ...tags }) => ({
      measurement: 'in_complete_fields',
      tags: { ...tags, regStatus: 'IN_PROGRESS' },
      fields: { compositionId },
      timestamp
    })
  )

  await influx.dropMeasurement('in_complete_fields')
  await influx.writePoints(updatePoints)
}

export const down = async () => {}
