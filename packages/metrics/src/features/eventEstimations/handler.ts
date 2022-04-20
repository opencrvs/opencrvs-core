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

/**
 *
 * @deprecated
 */
export async function eventEstimationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const fallbackResponse = {
    actualRegistration: 0,
    estimatedRegistration: 0,
    estimatedPercentage: 0,
    malePercentage: 0,
    femalePercentage: 0
  }
  return {
    birthTargetDayMetrics: fallbackResponse,
    birth1YearMetrics: fallbackResponse,
    birth5YearMetrics: fallbackResponse,
    deathTargetDayMetrics: fallbackResponse,
    death1YearMetrics: fallbackResponse,
    death5YearMetrics: fallbackResponse
  }
}
