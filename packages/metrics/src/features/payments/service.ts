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
import { EVENT_TYPE } from '@metrics/features/metrics/utils'

import { query } from '@metrics/influxdb/client'

export async function getTotalPayments(
  timeFrom: string,
  timeTo: string,
  locationId: string | undefined,
  eventType: EVENT_TYPE
) {
  const totalMetrics = await query<
    Array<{ total: number; paymentType: string }>
  >(
    `SELECT SUM(total) AS total
      FROM payment
    WHERE eventType = $eventType
      AND time > $timeFrom
      AND time <= $timeTo
      ${
        locationId
          ? `AND ( locationLevel2 = $locationId
      OR locationLevel3 = $locationId
      OR locationLevel4 = $locationId
      OR locationLevel5 = $locationId)`
          : ``
      }
    GROUP BY paymentType`,
    {
      placeholders: {
        locationId,
        timeFrom,
        timeTo,
        eventType
      }
    }
  )

  return totalMetrics
}
