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
import { query } from '@metrics/influxdb/client'
import { EVENT_TYPE } from '@metrics/features/metrics/utils'
import { fetchLocationChildrenIds } from '@metrics/configApi'
import { helpers } from '@metrics/utils/queryHelper'
import { ResourceIdentifier, Location } from '@opencrvs/commons/types'

export interface IPractitionerMetrics {
  practitionerId: string
  totalStarted: number
}

export async function fetchLocationWiseDeclarationsStarted(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>
) {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')
  const [officeLocationInChildren, locationPlaceholders] = helpers.in(
    locationIds,
    'officeLocation'
  )
  const fieldAgent = await query(
    `SELECT COUNT(role)
          FROM declarations_started
        WHERE time > $timeFrom
          AND time <= $timeTo
          AND (${officeLocationInChildren})
          AND role = 'FIELD_AGENT'`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        ...locationPlaceholders
      }
    }
  )

  const office = await query(
    `SELECT COUNT(role)
          FROM declarations_started
        WHERE time > $timeFrom
          AND time <= $timeTo
          AND (${officeLocationInChildren})
          AND ( role = 'REGISTRAR' OR role = 'REGISTRATION_AGENT' )`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        ...locationPlaceholders
      }
    }
  )

  const hospital = await query(
    `SELECT COUNT(role)
          FROM declarations_started
        WHERE time > $timeFrom
          AND time <= $timeTo
          AND (${officeLocationInChildren})
          AND ( role = 'NOTIFICATION_API_USER' OR role = 'API_USER' )`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        locationId
      }
    }
  )

  return {
    fieldAgentDeclarations:
      (fieldAgent && fieldAgent.length > 0 && fieldAgent[0].count) || 0,
    hospitalDeclarations:
      (hospital && hospital.length > 0 && hospital[0].count) || 0,
    officeDeclarations: (office && office.length > 0 && office[0].count) || 0
  }
}

export async function getNumberOfAppStartedByPractitioners(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>,
  event?: EVENT_TYPE,
  status?: string
): Promise<
  {
    practitionerId: string
    totalStarted: number
  }[]
> {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')
  const [officeLocationInChildren, locationPlaceholders] = helpers.in(
    locationIds,
    'officeLocation'
  )

  const eventClause = (event && `AND eventType = $event`) || ''
  const statusClause = (status && `AND status = $status`) || ''
  const totalDeclarationStarted: {
    practitionerId: string
    totalStarted: number
  }[] = await query(
    `SELECT COUNT(compositionId) as totalStarted
            FROM declarations_started
            WHERE time > $timeFrom
              AND time <= $timeTo
              AND (${officeLocationInChildren})
              ${eventClause}
              ${statusClause}
              GROUP BY practitionerId`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        event,
        status,
        ...locationPlaceholders
      }
    }
  )
  return totalDeclarationStarted
}

export async function getNumberOfRejectedAppStartedByPractitioners(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>,
  event?: EVENT_TYPE
): Promise<
  {
    startedBy: string
    totalStarted: number
  }[]
> {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')
  const [officeLocationInChildren, locationPlaceholders] = helpers.in(
    locationIds,
    'officeLocation'
  )

  const eventClause = (event && `AND eventType = $event`) || ''
  const totalRejectedAppStarted: {
    startedBy: string
    totalStarted: number
  }[] = await query(
    `SELECT COUNT(compositionId) as totalStarted
              FROM declarations_rejected
              WHERE time > $timeFrom
                AND time <= $timeTo
                AND (${officeLocationInChildren})
                ${eventClause}
                GROUP BY startedBy`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        event,
        ...locationPlaceholders
      }
    }
  )
  return totalRejectedAppStarted
}

export async function getAvgTimeSpentOnAppByPractitioners(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>,
  status: string,
  event?: EVENT_TYPE
): Promise<
  {
    practitionerId: string
    totalDeclarations: number
    totalTimeSpent: number
  }[]
> {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')
  const [officeLocationInChildren, locationPlaceholders] = helpers.in(
    locationIds,
    'officeLocation'
  )

  const eventClause = (event && `AND eventType = '${event}'`) || ''
  const averageTimeForDeclarations: {
    practitionerId: string
    totalDeclarations: number
    totalTimeSpent: number
  }[] = await query(
    `SELECT SUM(timeSpentEditing) as totalTimeSpent,
                COUNT(compositionId) as totalDeclarations
                FROM declaration_time_logged
                WHERE time > $timeFrom
                    AND time <= $timeTo
                    AND currentStatus = $status
                    AND (${officeLocationInChildren})
                    ${eventClause}
                    GROUP BY practitionerId`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        event,
        status,
        ...locationPlaceholders
      }
    }
  )
  return averageTimeForDeclarations
}
