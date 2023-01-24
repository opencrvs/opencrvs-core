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
import { getServiceHealth, PingService } from './api'
import { performance } from 'perf_hooks'
import { logger } from '@gateway/logger'

const SERVICES_TO_CHECK: readonly PingService[] = [
  { name: 'auth', url: new URL('ping', AUTH_URL) },
  { name: 'user-mgnt', url: new URL('ping', USER_MANAGEMENT_URL) },
  { name: 'metrics', url: new URL('ping', METRICS_URL) },
  { name: 'notification', url: new URL('ping', NOTIFICATION_URL) },
  { name: 'countryconfig', url: new URL('ping', COUNTRY_CONFIG_URL) },
  { name: 'search', url: new URL('ping', SEARCH_URL) },
  { name: 'workflow', url: new URL('ping', WORKFLOW_URL) }
]

export async function checkServiceHealth(service: PingService) {
  try {
    const timeStart = performance.now()
    const serviceHealth = await getServiceHealth(service)
    const timeEnd = performance.now()
    return { ...service, ...serviceHealth, ping: timeEnd - timeStart }
  } catch (e) {
    logger.error(e)
    return { ...service, status: 'error' }
  }
}

export default async function healthCheckHandler() {
  const response = await Promise.all(SERVICES_TO_CHECK.map(checkServiceHealth))
  return response
}

export const serviceHealthSchema = Joi.array().items(
  Joi.object({
    name: Joi.string(),
    url: Joi.object(),
    status: Joi.boolean()
  }).unknown()
)
