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
import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { checkServiceHealth } from '@gateway/features/healthCheck/service'
import {
  AUTH_URL,
  SEARCH_URL,
  USER_MANAGEMENT_URL,
  METRICS_URL,
  NOTIFICATION_URL,
  RESOURCES_URL,
  WORKFLOW_URL
} from '@gateway/constants'

enum Services {
  AUTH = 'auth',
  USER_MGNT = 'user-mgnt',
  METRICS = 'metrics',
  NOTIFICATION = 'notification',
  RESOURCES = 'resources',
  SEARCH = 'search',
  WORKFLOW = 'workflow',
  GATEWAY = 'gateway'
}

export default async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const service = request.query['service'][0]
  if (!service) {
    return {
      success: false
    }
  }

  let response

  switch (service) {
    case Services.GATEWAY:
      response = {
        success: true
      }
      break
    case Services.AUTH:
      response = {
        success: await checkServiceHealth(`${AUTH_URL}/ping`)
      }
      break
    case Services.SEARCH:
      response = {
        success: await checkServiceHealth(`${SEARCH_URL}ping`)
      }
      break
    case Services.USER_MGNT:
      response = {
        success: await checkServiceHealth(`${USER_MANAGEMENT_URL}ping`)
      }
      break
    case Services.METRICS:
      response = {
        success: await checkServiceHealth(`${METRICS_URL}/ping`)
      }
      break
    case Services.NOTIFICATION:
      response = {
        success: await checkServiceHealth(`${NOTIFICATION_URL}ping`)
      }
      break
    case Services.RESOURCES:
      response = {
        success: await checkServiceHealth(`${RESOURCES_URL}/ping`)
      }
      break
    case Services.WORKFLOW:
      response = {
        success: await checkServiceHealth(`${WORKFLOW_URL}ping`)
      }
      break
    default:
      return {
        success: false
      }
  }

  return response
}

export const querySchema = Joi.object({
  service: Joi.array()
    .items(
      Joi.string().valid(
        Services.AUTH,
        Services.USER_MGNT,
        Services.METRICS,
        Services.NOTIFICATION,
        Services.RESOURCES,
        Services.SEARCH,
        Services.WORKFLOW,
        Services.GATEWAY
      )
    )
    .single()
})
export const responseSchema = Joi.object({
  success: Joi.boolean()
})
