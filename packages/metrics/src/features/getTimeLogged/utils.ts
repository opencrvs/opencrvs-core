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
          FROM application_time_logged
        WHERE compositionId = '${compositionId}'
        AND currentStatus = '${status}'`
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
          FROM application_time_logged
        WHERE compositionId = '${compositionId}'`
  )
  return timeLoggedData && timeLoggedData.length > 0 ? timeLoggedData : []
}

export async function getTimeLoggedForPractitioner(
  timeFrom: string,
  timeTo: string,
  practitionerId: string,
  locationId: string
): Promise<ITimeLoggedData[]> {
  const timeLoggedData: ITimeLoggedData[] = await query(
    `SELECT currentStatus as status, trackingId, 
        eventType, timeSpentEditing, time
          FROM application_time_logged
        WHERE time > '${timeFrom}' AND time <= '${timeTo}'
        AND practitionerId = '${practitionerId}'
        AND ( locationLevel2 = '${locationId}' 
              OR locationLevel3 = '${locationId}' 
              OR locationLevel4 = '${locationId}' 
              OR locationLevel5 = '${locationId}')`
  )
  return timeLoggedData && timeLoggedData.length > 0 ? timeLoggedData : []
}
