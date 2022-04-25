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

export async function fetchLocationWiseDeclarationsStarted(
  timeFrom: string,
  timeTo: string,
  locationId: string,
  event: EVENT_TYPE
) {
  const fieldAgent = await query(
    `SELECT COUNT(role)
          FROM declarations_started
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
          FROM declarations_started
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
          FROM declarations_started
        WHERE time > '${timeFrom}'
          AND time <= '${timeTo}'
          AND ( officeLocation = '${locationId}'
              OR locationLevel2 = '${locationId}'
              OR locationLevel3 = '${locationId}'
              OR locationLevel4 = '${locationId}'
              OR locationLevel5 = '${locationId}' )
          AND ( role = 'NOTIFICATION_API_USER' OR role = 'API_USER' )`
  )

  const totalWithRole: { role: string; total: number }[] =
    await query(`SELECT COUNT(compositionId) AS total
  FROM declarations_started WHERE time > '${timeFrom}'
  AND time <= '${timeTo}'
  AND ( officeLocation = '${locationId}'
      OR locationLevel2 = '${locationId}'
      OR locationLevel3 = '${locationId}'
      OR locationLevel4 = '${locationId}'
      OR locationLevel5 = '${locationId}')
  AND eventType = '${event}'
  GROUP BY role`)

  return {
    fieldAgentDeclarations:
      (fieldAgent && fieldAgent.length > 0 && fieldAgent[0].count) || 0,
    hospitalDeclarations:
      (hospital && hospital.length > 0 && hospital[0].count) || 0,
    officeDeclarations: (office && office.length > 0 && office[0].count) || 0,
    totalWithRole
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
  const totalDeclarationStarted: {
    practitionerId: string
    totalStarted: number
  }[] = await query(
    `SELECT COUNT(compositionId) as totalStarted
            FROM declarations_started
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
  return totalDeclarationStarted
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
              FROM declarations_rejected
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
    totalDeclarations: number
    totalTimeSpent: number
  }[]
> {
  const eventClause = (event && `AND eventType = '${event}' `) || ''
  const averageTimeForDeclarations: {
    practitionerId: string
    totalDeclarations: number
    totalTimeSpent: number
  }[] = await query(
    `SELECT SUM(timeSpentEditing) as totalTimeSpent, 
                COUNT(compositionId) as totalDeclarations
                FROM declaration_time_logged
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
  return averageTimeForDeclarations
}
