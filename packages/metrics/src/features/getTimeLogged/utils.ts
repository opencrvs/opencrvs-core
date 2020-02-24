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
  timeSpentEditing: number
}

export async function getTimeLoggedByStatus(
  compositionId: string,
  status: string
): Promise<ITimeLoggedData[]> {
  return await query(
    `SELECT timeSpentEditing
          FROM application_time_logged
        WHERE compositionId = '${compositionId}'
        AND currentStatus = '${status}'`
  )
}
