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

import { fetchLocationChildrenIds } from '@metrics/configApi'
import { query } from '@metrics/influxdb/client'
import { createChunks } from '@metrics/utils/batchHelpers'
import { helpers } from '@metrics/utils/queryHelper'
import { logger } from '@opencrvs/commons'
import { ResourceIdentifier, Location } from '@opencrvs/commons/types'

export async function getTotalCertificationsByLocation(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>
) {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')

  const batchQuery = async (locationIds: string[]) => {
    const [officeLocationInChildren, locationPlaceholders] = helpers.in(
      locationIds,
      'officeLocation'
    )
    try {
      return await query<Array<{ total: number; eventType: string }>>(
        `SELECT COUNT(DISTINCT(compositionId)) AS total
          FROM certification
        WHERE time > $timeFrom
          AND time <= $timeTo
          AND (${officeLocationInChildren})
        GROUP BY eventType`,
        {
          placeholders: {
            timeFrom,
            timeTo,
            ...locationPlaceholders
          }
        }
      )
    } catch (error) {
      logger.error(
        `Error fetching total certifications by location: ${error.message}`
      )
      throw error
    }
  }

  const locationBatches = createChunks(locationIds, 1000)
  return await Promise.all(locationBatches.map(batchQuery)).then((res) =>
    res.flat()
  )
}

export async function getTotalCertifications(timeFrom: string, timeTo: string) {
  const totalMetrics = await query<Array<{ total: number; eventType: string }>>(
    `SELECT COUNT(DISTINCT(compositionId)) AS total
      FROM certification
    WHERE time > $timeFrom
      AND time <= $timeTo
    GROUP BY eventType`,
    {
      placeholders: {
        timeFrom,
        timeTo
      }
    }
  )

  return totalMetrics
}
