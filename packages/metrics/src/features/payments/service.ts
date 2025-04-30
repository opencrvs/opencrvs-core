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
import { EVENT_TYPE } from '@metrics/features/metrics/utils'

import { query } from '@metrics/influxdb/client'
import { fetchLocationChildrenIds } from '@metrics/configApi'
import { helpers } from '@metrics/utils/queryHelper'
import { logger } from '@opencrvs/commons'
import { createChunks } from '@metrics/utils/batchHelpers'

export async function getTotalPayments(
  timeFrom: string,
  timeTo: string,
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
    GROUP BY paymentType`,
    {
      placeholders: {
        timeFrom,
        timeTo,
        eventType
      }
    }
  )

  return totalMetrics
}

export async function getTotalPaymentsByLocation(
  timeFrom: string,
  timeTo: string,
  locationId: ResourceIdentifier<Location>,
  eventType: EVENT_TYPE
) {
  const locationIds = await fetchLocationChildrenIds(locationId, 'CRVS_OFFICE')

  const batchQuery = async (locationIds: string[]) => {
    const [officeLocationInChildren, locationPlaceholders] = helpers.in(
      locationIds,
      'officeLocation'
    )

    try {
      return await query<Array<{ total: number; paymentType: string }>>(
        `SELECT SUM(total) AS total
          FROM payment
        WHERE eventType = $eventType
          AND time > $timeFrom
          AND time <= $timeTo
          AND (${officeLocationInChildren})
        GROUP BY paymentType`,
        {
          placeholders: {
            timeFrom,
            timeTo,
            eventType,
            ...locationPlaceholders
          }
        }
      )
    } catch (error) {
      logger.error(
        `Error fetching total payments by location: ${error.message}`
      )
      throw error
    }
  }

  const locationBatches = createChunks(locationIds, 1000)

  return await Promise.all(locationBatches.map(batchQuery)).then((res) =>
    res.flat()
  )
}
