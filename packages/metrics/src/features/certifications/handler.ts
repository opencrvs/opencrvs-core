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
import * as Hapi from '@hapi/hapi'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID
} from '@metrics/features/metrics/constants'
import {
  getTotalCertifications,
  getTotalCertificationsByLocation
} from '@metrics/features/certifications/service'

export async function totalCertificationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = request.query[LOCATION_ID]
    ? (`Location/${request.query[LOCATION_ID]}` as const)
    : undefined

  if (locationId) {
    return getTotalCertificationsByLocation(timeStart, timeEnd, locationId)
  } else {
    return getTotalCertifications(timeStart, timeEnd)
  }
}
