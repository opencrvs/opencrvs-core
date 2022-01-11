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
import { query } from '@metrics/influxdb/client'
import { EVENT_TYPE } from '@metrics/features/metrics/utils'

export interface IPractitionerMetrics {
  practitionerId: string
  totalStarted: number
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
          AND ( officeLocation = '${locationId}'
              OR locationLevel2 = '${locationId}'
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
          AND ( officeLocation = '${locationId}'
              OR locationLevel2 = '${locationId}'
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
          AND ( officeLocation = '${locationId}'
              OR locationLevel2 = '${locationId}'
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

export async function getNumberOfAppStartedByPractitioners(
  timeFrom: string,
  timeTo: string,
  locationId: string,
  event?: EVENT_TYPE,
  status?: string
): Promise<
  {
    practitionerId: string
    totalStarted: number
  }[]
> {
  const eventClause = (event && `AND eventType = '${event}' `) || ''
  const statusClause = (status && `AND status = '${status}' `) || ''
  const totalApplicationStarted: {
    practitionerId: string
    totalStarted: number
  }[] = await query(
    `SELECT COUNT(compositionId) as totalStarted
            FROM applications_started
            WHERE time > '${timeFrom}'
              AND time <= '${timeTo}'
              AND ( officeLocation = '${locationId}'
                  OR locationLevel2 = '${locationId}'
                  OR locationLevel3 = '${locationId}'
                  OR locationLevel4 = '${locationId}'
                  OR locationLevel5 = '${locationId}' ) 
              ${eventClause}
              ${statusClause}    
              GROUP BY practitionerId`
  )
  return totalApplicationStarted
}

export async function getNumberOfRejectedAppStartedByPractitioners(
  timeFrom: string,
  timeTo: string,
  locationId: string,
  event?: EVENT_TYPE
): Promise<
  {
    startedBy: string
    totalStarted: number
  }[]
> {
  const eventClause = (event && `AND eventType = '${event}' `) || ''
  const totalRejectedAppStarted: {
    startedBy: string
    totalStarted: number
  }[] = await query(
    `SELECT COUNT(compositionId) as totalStarted
              FROM applications_rejected
              WHERE time > '${timeFrom}'
                AND time <= '${timeTo}'
                AND ( officeLocation = '${locationId}'
                    OR locationLevel2 = '${locationId}'
                    OR locationLevel3 = '${locationId}'
                    OR locationLevel4 = '${locationId}'
                    OR locationLevel5 = '${locationId}' ) 
                ${eventClause}
                GROUP BY startedBy`
  )
  return totalRejectedAppStarted
}

export async function getAvgTimeSpentOnAppByPractitioners(
  timeFrom: string,
  timeTo: string,
  locationId: string,
  status: string,
  event?: EVENT_TYPE
): Promise<
  {
    practitionerId: string
    totalApplications: number
    totalTimeSpent: number
  }[]
> {
  const eventClause = (event && `AND eventType = '${event}' `) || ''
  const averageTimeForApplications: {
    practitionerId: string
    totalApplications: number
    totalTimeSpent: number
  }[] = await query(
    `SELECT SUM(timeSpentEditing) as totalTimeSpent, 
                COUNT(compositionId) as totalApplications
                FROM application_time_logged
                WHERE time > '${timeFrom}'
                    AND time <= '${timeTo}'
                    AND currentStatus = '${status}'
                    AND ( officeLocation = '${locationId}'
                        OR locationLevel2 = '${locationId}'
                        OR locationLevel3 = '${locationId}'
                        OR locationLevel4 = '${locationId}'
                        OR locationLevel5 = '${locationId}' ) 
                    ${eventClause}
                    GROUP BY practitionerId`
  )
  return averageTimeForApplications
}
