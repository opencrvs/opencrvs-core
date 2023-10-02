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

export async function getTotalCertifications(
  timeFrom: string,
  timeTo: string,
  locationId: string | undefined
) {
  const totalMetrics = await query<Array<{ total: number; eventType: string }>>(
    `SELECT COUNT(DISTINCT(compositionId)) AS total
      FROM certification
    WHERE time > $timeFrom
      AND time <= $timeTo
      ${
        locationId
          ? `AND ( locationLevel1 = $locationId
      OR locationLevel2 = $locationId      
      OR locationLevel3 = $locationId
      OR locationLevel4 = $locationId
      OR locationLevel5 = $locationId
      OR officeLocation = $locationId)`
          : ``
      }
    GROUP BY eventType`,
    {
      placeholders: {
        locationId,
        timeFrom,
        timeTo
      }
    }
  )

  return totalMetrics
}
