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

export const influx = new InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'birth_registration',
      fields: {
        compositionId: FieldType.STRING,
        currentStatus: FieldType.STRING,
        ageInDays: FieldType.INTEGER
      },
      tags: [
        'regStatus',
        'gender',
        'timeLabel',
        'ageLabel',
        'dateLabel',
        'registrarPractitionerId',
        'practitionerRole',
        'eventLocationType',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2'
      ]
    },
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
        'locationLevel2'
      ]
    }
  ]
})

export const query = (query, options) => {
  try {
    return influx.query(query, options)
  } catch (err) {
    console.error(`Error reading data from InfluxDB! ${err.stack}`)
    throw err
  }
}

export const writePoints = (points) => {
  return influx.writePoints(points).catch((err) => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
    throw err
  })
}
