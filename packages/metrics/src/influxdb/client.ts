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
import * as Influx from 'influx'
import {
  INFLUX_DB,
  INFLUX_HOST,
  INFLUX_PORT
} from '@metrics/influxdb/constants'
import { logger } from '@metrics/logger'

export const influx = new Influx.InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'birth_reg',
      fields: {
        current_status: Influx.FieldType.STRING,
        age_in_days: Influx.FieldType.INTEGER
      },
      tags: [
        'reg_status',
        'gender',
        'locationLevel2',
        'locationLevel3',
        'locationLevel4',
        'locationLevel5'
      ]
    }
  ]
})

export const writePoints = (points: any[]) => {
  return influx.writePoints(points).catch((err: Error) => {
    logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    throw err
  })
}

export const readPoints = (query: string) => {
  try {
    return influx.query(query)
  } catch (err) {
    logger.error(`Error reading data from InfluxDB! ${err.stack}`)
    throw err
  }
}
