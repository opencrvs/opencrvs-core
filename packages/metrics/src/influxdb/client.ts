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
import { IPoints } from '@metrics/features/registration'

export const influx = new Influx.InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'birth_reg',
      fields: {
        compositionId: Influx.FieldType.STRING,
        locationLevel5: Influx.FieldType.STRING,
        locationLevel4: Influx.FieldType.STRING,
        locationLevel3: Influx.FieldType.STRING,
        locationLevel2: Influx.FieldType.STRING,
        currentStatus: Influx.FieldType.STRING,
        ageInDays: Influx.FieldType.INTEGER
      },
      tags: ['regStatus', 'gender']
    },
    {
      measurement: 'death_reg',
      fields: {
        compositionId: Influx.FieldType.STRING,
        locationLevel5: Influx.FieldType.STRING,
        locationLevel4: Influx.FieldType.STRING,
        locationLevel3: Influx.FieldType.STRING,
        locationLevel2: Influx.FieldType.STRING,
        currentStatus: Influx.FieldType.STRING,
        ageInYears: Influx.FieldType.INTEGER
      },
      tags: ['regStatus', 'gender']
    },
    {
      measurement: 'in_complete_fields',
      fields: {
        compositionId: Influx.FieldType.STRING,
        locationLevel5: Influx.FieldType.STRING,
        locationLevel4: Influx.FieldType.STRING,
        locationLevel3: Influx.FieldType.STRING,
        locationLevel2: Influx.FieldType.STRING
      },
      tags: [
        'regStatus',
        'missingFieldSectionId',
        'missingFieldGroupId',
        'missingFieldId',
        'eventType'
      ]
    },
    {
      measurement: 'application_time_logged',
      fields: {
        timeSpentEditing: Influx.FieldType.INTEGER,
        compositionId: Influx.FieldType.STRING
      },
      tags: ['currentStatus', 'eventType']
    },
    {
      measurement: 'application_event_duration',
      fields: {
        durationInSeconds: Influx.FieldType.INTEGER,
        compositionId: Influx.FieldType.STRING,
        currentTaskId: Influx.FieldType.STRING,
        previousTaskId: Influx.FieldType.STRING
      },
      tags: ['currentStatus', 'previousStatus', 'eventType']
    },
    {
      measurement: 'certification_payment',
      fields: {
        total: Influx.FieldType.FLOAT,
        compositionId: Influx.FieldType.STRING
      },
      tags: []
    }
  ]
})

export const writePoints = (points: IPoints[]) => {
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
