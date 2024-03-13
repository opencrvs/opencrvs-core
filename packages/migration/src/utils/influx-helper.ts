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

import { InfluxDB, FieldType, IPoint, IQueryOptions } from 'influx'

const INFLUX_HOST = process.env.INFLUX_HOST || 'localhost'
const INFLUX_PORT = process.env.INFLUX_PORT || 8086
const INFLUX_DB = process.env.INFLUX_DB || 'ocrvs'

export const influx = new InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: Number(INFLUX_PORT),
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
        'locationLevel2',
        'locationLevel1'
      ]
    },
    {
      measurement: 'death_registration',
      fields: {
        compositionId: FieldType.STRING,
        currentStatus: FieldType.STRING,
        ageInYears: FieldType.INTEGER,
        deathDays: FieldType.INTEGER
      },
      tags: [
        'regStatus',
        'gender',
        'ageLabel',
        'timeLabel',
        'dateLabel',
        'registrarPractitionerId',
        'practitionerRole',
        'eventLocationType',
        'mannerOfDeath',
        'causeOfDeath',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2',
        'locationLevel1'
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
        'locationLevel2',
        'locationLevel1'
      ]
    }
  ]
})

export const query = async (query: string, options?: IQueryOptions) => {
  try {
    return await influx.query(query, options)
  } catch (err) {
    console.error(`Error reading data from InfluxDB! ${(err as Error).stack}`)
    throw err
  }
}

export const writePoints = async (points: IPoint[]) => {
  return influx.writePoints(points).catch((err) => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
    throw err
  })
}
