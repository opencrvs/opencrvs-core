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
import * as Influx from 'influx'
import {
  INFLUX_DB,
  INFLUX_HOST,
  INFLUX_PORT
} from '@metrics/influxdb/constants'
import { logger } from '@metrics/logger'
import { IPoints } from '@metrics/features/registration'
import fetch from 'node-fetch'

export const influx = new Influx.InfluxDB({
  host: INFLUX_HOST,
  database: INFLUX_DB,
  port: INFLUX_PORT,
  schema: [
    {
      measurement: 'certification',
      fields: {
        compositionId: Influx.FieldType.STRING
      },
      tags: [
        'eventType',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2',
        'locationLevel1'
      ]
    },
    {
      measurement: 'birth_registration',
      fields: {
        compositionId: Influx.FieldType.STRING,
        currentStatus: Influx.FieldType.STRING,
        ageInDays: Influx.FieldType.INTEGER
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
        compositionId: Influx.FieldType.STRING,
        currentStatus: Influx.FieldType.STRING,
        ageInYears: Influx.FieldType.INTEGER,
        deathDays: Influx.FieldType.INTEGER
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
      measurement: 'in_complete_fields',
      fields: {
        compositionId: Influx.FieldType.STRING
      },
      tags: [
        'regStatus',
        'missingFieldSectionId',
        'missingFieldGroupId',
        'missingFieldId',
        'eventType',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2',
        'locationLevel1'
      ]
    },
    {
      measurement: 'declaration_time_logged',
      fields: {
        timeSpentEditing: Influx.FieldType.INTEGER,
        compositionId: Influx.FieldType.STRING
      },
      tags: [
        'currentStatus',
        'trackingId',
        'eventType',
        'practitionerId',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2',
        'locationLevel1'
      ]
    },
    {
      measurement: 'declaration_event_duration',
      fields: {
        durationInSeconds: Influx.FieldType.INTEGER,
        compositionId: Influx.FieldType.STRING,
        currentTaskId: Influx.FieldType.STRING,
        previousTaskId: Influx.FieldType.STRING
      },
      tags: ['currentStatus', 'previousStatus', 'eventType']
    },
    {
      measurement: 'correction',
      fields: {
        compositionId: Influx.FieldType.STRING
      },
      tags: [
        'eventType',
        'reason',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2',
        'locationLevel1'
      ]
    },
    {
      measurement: 'payment',
      fields: {
        total: Influx.FieldType.FLOAT,
        compositionId: Influx.FieldType.STRING
      },
      tags: [
        'eventType',
        'paymentType',
        'officeLocation',
        'locationLevel5',
        'locationLevel4',
        'locationLevel3',
        'locationLevel2',
        'locationLevel1'
      ]
    },
    {
      measurement: 'declarations_started',
      fields: {
        role: Influx.FieldType.STRING,
        status: Influx.FieldType.STRING,
        compositionId: Influx.FieldType.STRING
      },
      tags: [
        'eventType',
        'practitionerId',
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
        compositionId: Influx.FieldType.STRING
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
    },
    {
      measurement: 'search_requests',
      fields: {
        clientId: Influx.FieldType.STRING
      },
      tags: ['ipAddress']
    },
    {
      measurement: 'user_audit_event',
      fields: {
        data: Influx.FieldType.STRING,
        ipAddress: Influx.FieldType.STRING,
        userAgent: Influx.FieldType.STRING
      },
      tags: ['action', 'practitionerId']
    },
    {
      measurement: 'marriage_registration',
      fields: {
        compositionId: Influx.FieldType.STRING,
        currentStatus: Influx.FieldType.STRING,
        daysAfterEvent: Influx.FieldType.INTEGER
      },
      tags: [
        'regStatus',
        'timeLabel',
        'dateLabel',
        'registrarPractitionerId',
        'practitionerRole',
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

export const writePoints = (points: IPoints[]) => {
  return influx.writePoints(points).catch((err: Error) => {
    logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    throw err
  })
}

type InfluxQueryOptions = {
  placeholders: Record<string, any>
}

export const query = <T = any>(
  q: string,
  options?: InfluxQueryOptions
): Promise<T> => {
  try {
    return influx.query(q, options)
  } catch (err) {
    logger.error(`Error reading data from InfluxDB! ${err.stack}`)
    throw err
  }
}

export async function deleteMeasurements() {
  try {
    await Promise.all([
      influx.dropMeasurement('in_complete_fields', INFLUX_DB),
      influx.dropMeasurement('declaration_time_logged', INFLUX_DB),
      influx.dropMeasurement('declaration_event_duration', INFLUX_DB),
      influx.dropMeasurement('certification_payment', INFLUX_DB),
      influx.dropMeasurement('correction_payment', INFLUX_DB),
      influx.dropMeasurement('declarations_started', INFLUX_DB),
      influx.dropMeasurement('declarations_rejected', INFLUX_DB),
      influx.dropMeasurement('user_audit_event', INFLUX_DB),
      influx.dropMeasurement('marriage_registration', INFLUX_DB),
      influx.dropMeasurement('death_registration', INFLUX_DB),
      influx.dropMeasurement('birth_registration', INFLUX_DB)
    ])
    return {
      status: `Successfully deleted all the measurements form ${INFLUX_DB} database`
    }
  } catch (err) {
    logger.error(`Error deleting ${INFLUX_DB} database from InfluxDB! ${err}`)
    throw err
  }
}

export async function getCSV(measurement: string) {
  // This is done with a plain HTTP request so the result can be streamed
  const res = await fetch(
    `http://${INFLUX_HOST}:${INFLUX_PORT}/query?db=${INFLUX_DB}&q=SELECT * FROM ${measurement}`,
    {
      headers: {
        Accept: 'application/csv'
      }
    }
  )
  return res.body
}
