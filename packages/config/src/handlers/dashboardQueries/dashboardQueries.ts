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
import { COUNTRY_CONFIG_URL } from '@config/config/constants'
import { defaultQueries } from './defaultQueries'
import fetch from 'node-fetch'

export default async function getDashboardQueries(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = request.headers.authorization
  const response = await fetch(
    `${COUNTRY_CONFIG_URL}/dashboards/queries.json`,
    {
      headers: {
        Authorization: token
      }
    }
  )

  if (response.status === 404) {
    return defaultQueries()
  }

  if (!response.ok) {
    throw new Error(
      `Error fetching dashboard queries: ${JSON.stringify(
        await response.json(),
        null,
        4
      )}`
    )
  }

  return response.json()
}
