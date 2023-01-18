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
import fetch from 'node-fetch'
import * as path from 'path'

export async function checkServiceHealth(service: typeof services[0]) {
  try {
    const res = await fetch(path.join(service.url, '/ping'), {
      method: 'GET'
    })

    const body = await res.json()

    if (body.success === true) {
      return { ...service, status: true }
    } else {
      return { ...service, status: false }
    }
  } catch (e) {
    return { ...service, status: false }
  }
}

const services = [
  { name: 'auth', url: AUTH_URL },
  { name: 'user-mgnt', url: USER_MANAGEMENT_URL },
  { name: 'metrics', url: METRICS_URL },
  { name: 'notification', url: NOTIFICATION_URL },
  { name: 'countryconfig', url: COUNTRY_CONFIG_URL },
  { name: 'search', url: SEARCH_URL },
  { name: 'workflow', url: WORKFLOW_URL }
]

export default async function healthCheckHandler() {
  const response = await Promise.all(services.map(checkServiceHealth))
  return response
}

export const responseSchema = Joi.array().items({
  name: Joi.string(),
  url: Joi.string(),
  status: Joi.boolean()
})
