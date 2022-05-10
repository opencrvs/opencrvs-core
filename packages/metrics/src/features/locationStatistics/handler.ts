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
import * as Hapi from '@hapi/hapi'
import { getLocationStatistics } from '@metrics/features/locationStatistics/service'
import {
  LOCATION_ID,
  POPULATION_YEAR
} from '@metrics/features/metrics/constants'
import { IAuthHeader } from '@metrics/features/registration'

export async function locationStatisticsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const locationId = request.query[LOCATION_ID]
    ? 'Location/' + request.query[LOCATION_ID]
    : undefined
  const populationYear = request.query[POPULATION_YEAR]
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  return getLocationStatistics(locationId, populationYear, authHeader)
}
