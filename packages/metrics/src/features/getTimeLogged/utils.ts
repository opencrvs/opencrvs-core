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
import { Location, ResourceIdentifier } from '@opencrvs/commons/types'
import { fetchLocationChildrenIds } from '@metrics/configApi'
import { query } from '@metrics/influxdb/client'
import { helpers } from '@metrics/utils/queryHelper'

export interface ITimeLoggedData {
  status?: string
  trackingId?: string
  eventType?: string
  time?: string
  timeSpentEditing: number
}

export async function getTimeLoggedByStatus(
  compositionId: string,
  status: string
): Promise<ITimeLoggedData> {
  const timeLoggedData: ITimeLoggedData[] = await query(
    `SELECT timeSpentEditing
          FROM declaration_time_logged
        WHERE compositionId = $compositionId
        AND currentStatus = $status`,
    {
      placeholders: {
        compositionId,
        status
      }
    }
  )
  return timeLoggedData && timeLoggedData.length > 0
    ? timeLoggedData[0]
    : // Send 0 if no logged data found for given status
      { timeSpentEditing: 0 }
}

export async function getTimeLogged(
  compositionId: string
): Promise<ITimeLoggedData[]> {
  const timeLoggedData: ITimeLoggedData[] = await query(
    `SELECT currentStatus as status, timeSpentEditing
          FROM declaration_time_logged
        WHERE compositionId = $compositionId`,
    {
      placeholders: {
        compositionId
      }
    }
  )
  return timeLoggedData && timeLoggedData.length > 0 ? timeLoggedData : []
}

export async function getTimeLoggedForPractitioner(
  timeFrom: string,
  timeTo: string,
  practitionerId: string,
  locationId: ResourceIdentifier<Location>,
  count?: number
): Promise<ITimeLoggedData[]> {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')
  const [officeLocationInChildren, locationPlaceholders] = helpers.in(
    locationIds,
    'officeLocation'
  )
  const countLimit = count ? 'LIMIT ' + count : ''
  const timeLoggedData: ITimeLoggedData[] = await query(
    `SELECT currentStatus as status, trackingId,
          eventType, timeSpentEditing, time
          FROM declaration_time_logged
            WHERE time > $timeFrom AND time <= $timeTo
            AND practitionerId = $practitionerId
            AND (${officeLocationInChildren})
              ORDER BY time DESC
              $countLimit`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        practitionerId,
        countLimit,
        ...locationPlaceholders
      }
    }
  )

  return timeLoggedData && timeLoggedData.length > 0 ? timeLoggedData : []
}

export async function countTimeLoggedForPractitioner(
  timeFrom: string,
  timeTo: string,
  practitionerId: string,
  locationId: ResourceIdentifier<Location>
): Promise<number> {
  const timeLoggedData = await getTimeLoggedForPractitioner(
    timeFrom,
    timeTo,
    practitionerId,
    locationId
  )
  return (timeLoggedData && timeLoggedData.length) || 0
}
