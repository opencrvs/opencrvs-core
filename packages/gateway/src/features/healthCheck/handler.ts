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
import * as Joi from 'joi'
import {
  AUTH_URL,
  SEARCH_URL,
  USER_MANAGEMENT_URL,
  METRICS_URL,
  NOTIFICATION_URL,
  COUNTRY_CONFIG_URL,
  WORKFLOW_URL
} from '@gateway/constants'
import fetch from '@gateway/fetch'

export async function checkServiceHealth(url: string) {
  const res = await fetch(url, {
    method: 'GET'
  })

  const body = await res.json()

  if (body.success === true) {
    return true
  }

  return false
}

enum Services {
  AUTH = 'auth',
  USER_MGNT = 'user-mgnt',
  METRICS = 'metrics',
  NOTIFICATION = 'notification',
  COUNTRY_CONFIG = 'countryconfig',
  SEARCH = 'search',
  WORKFLOW = 'workflow',
  GATEWAY = 'gateway'
}

const SERVICES = {
  [Services.AUTH]: `${AUTH_URL}/ping`,
  [Services.SEARCH]: `${SEARCH_URL}ping`,
  [Services.USER_MGNT]: `${USER_MANAGEMENT_URL}ping`,
  [Services.METRICS]: `${METRICS_URL}/ping`,
  [Services.NOTIFICATION]: `${NOTIFICATION_URL}ping`,
  [Services.COUNTRY_CONFIG]: `${COUNTRY_CONFIG_URL}/ping`,
  [Services.WORKFLOW]: `${WORKFLOW_URL}ping`
}

export default async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const responses = {} as Record<keyof typeof SERVICES, boolean>

  for (const [key, value] of Object.entries(SERVICES)) {
    try {
      const res = await checkServiceHealth(value)
      responses[key as keyof typeof SERVICES] = res
    } catch (err) {
      responses[key as keyof typeof SERVICES] = false
    }
  }
  return responses
}

export const querySchema = Joi.object({
  service: Joi.array()
    .items(
      Joi.string().valid(
        Services.AUTH,
        Services.USER_MGNT,
        Services.METRICS,
        Services.NOTIFICATION,
        Services.COUNTRY_CONFIG,
        Services.SEARCH,
        Services.WORKFLOW,
        Services.GATEWAY
      )
    )
    .single()
})
