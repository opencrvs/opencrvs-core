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
import * as Hapi from 'hapi'
import { query } from '@metrics/influxdb/client'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID
} from '@metrics/features/metrics/constants'

export async function applicationsStartedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = 'Location/' + request.query[LOCATION_ID]
  let applicationsStartedMetrics
  try {
    applicationsStartedMetrics = await fetchLocationWiseApplicationsStarted(
      timeStart,
      timeEnd,
      locationId
    )
  } catch (error) {
    applicationsStartedMetrics = {
      fieldAgentApplications: 0,
      hospitalApplications: 0,
      officeApplications: 0
    }
  }

  return applicationsStartedMetrics
}

export async function fetchLocationWiseApplicationsStarted(
  timeFrom: string,
  timeTo: string,
  locationId: string
) {
  const fieldAgent = await query(
    `SELECT COUNT(role)
        FROM applications_started
      WHERE time > '${timeFrom}'
        AND time <= '${timeTo}'
        AND ( locationLevel2 = '${locationId}'
            OR locationLevel3 = '${locationId}'
            OR locationLevel4 = '${locationId}'
            OR locationLevel5 = '${locationId}' )
        AND role = 'FIELD_AGENT'`
  )

  const office = await query(
    `SELECT COUNT(role)
        FROM applications_started
      WHERE time > '${timeFrom}'
        AND time <= '${timeTo}'
        AND ( locationLevel2 = '${locationId}'
            OR locationLevel3 = '${locationId}'
            OR locationLevel4 = '${locationId}'
            OR locationLevel5 = '${locationId}' )
        AND ( role = 'REGISTRAR' OR role = 'REGISTRATION_AGENT' )`
  )

  const hospital = await query(
    `SELECT COUNT(role)
        FROM applications_started
      WHERE time > '${timeFrom}'
        AND time <= '${timeTo}'
        AND ( locationLevel2 = '${locationId}'
            OR locationLevel3 = '${locationId}'
            OR locationLevel4 = '${locationId}'
            OR locationLevel5 = '${locationId}' )
        AND ( role = 'NOTIFICATION_API_USER' OR role = 'API_USER' )`
  )

  return {
    fieldAgentApplications:
      (fieldAgent && fieldAgent.length > 0 && fieldAgent[0].count) || 0,
    hospitalApplications:
      (hospital && hospital.length > 0 && hospital[0].count) || 0,
    officeApplications: (office && office.length > 0 && office[0].count) || 0
  }
}
