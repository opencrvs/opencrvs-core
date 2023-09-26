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
import * as Joi from 'joi'
import {
  AUTH_URL,
  SEARCH_URL,
  USER_MANAGEMENT_URL,
  METRICS_URL,
  NOTIFICATION_URL,
  COUNTRY_CONFIG_URL,
  WORKFLOW_URL,
  DOCUMENTS_URL,
  WEBHOOK_URL,
  APPLICATION_CONFIG_URL
} from '@gateway/constants'
import {
  getDependencyHealth,
  getServiceHealth,
  PingService,
  PingDependency
} from './api'
import { performance } from 'perf_hooks'
import { logger } from '@gateway/logger'

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

enum Dependencies {
  REDIS = 'redis',
  ELASTICSEARCH = 'elasticsearch',
  MONGODB = 'mongodb',
  INFLUXDB = 'influxdb',
  MINIO = 'minio',
  KIBANA = 'kibana',
  OPENHIM = 'openhim',
  HEARTH = 'hearth'
}

const SERVICES_TO_CHECK: readonly PingService[] = [
  { name: 'auth', url: new URL('ping', AUTH_URL) },
  { name: 'user-mgnt', url: new URL('ping', USER_MANAGEMENT_URL) },
  { name: 'metrics', url: new URL('ping', METRICS_URL) },
  { name: 'notification', url: new URL('ping', NOTIFICATION_URL) },
  { name: 'countryconfig', url: new URL('ping', COUNTRY_CONFIG_URL) },
  { name: 'search', url: new URL('ping', SEARCH_URL) },
  { name: 'workflow', url: new URL('ping', WORKFLOW_URL) },
  { name: 'documents', url: new URL('ping', DOCUMENTS_URL) },
  { name: 'webhooks', url: new URL('ping', WEBHOOK_URL) },
  { name: 'applicationconfig', url: new URL('ping', APPLICATION_CONFIG_URL) }
]
const DEPENDENCIES_TO_CHECK: readonly PingDependency[] = [
  { name: 'elasticSearch', url: 'http://localhost:9200/_cluster/health' },
  { name: 'minio', url: 'http://localhost:3535/minio/health/live' },
  { name: 'mongodb', url: 'http://localhost:3535/minio/health/live' },
  { name: 'influxdb', url: 'http://localhost:3535/minio/health/live' },
  { name: 'redis', url: 'http://localhost:3535/minio/health/live' },
  { name: 'kibana', url: 'http://localhost:3535/minio/health/live' },
  { name: 'openhim', url: 'http://localhost:3535/minio/health/live' },
  { name: 'hearth', url: 'http://localhost:3535/minio/health/live' }
]
export async function checkServiceHealth(service: PingService) {
  try {
    const timeStart = performance.now()
    const serviceHealth = await getServiceHealth(service)
    const timeEnd = performance.now()
    return {
      ...service,
      ...serviceHealth,
      ping: timeEnd - timeStart
    }
  } catch (e) {
    logger.error(e)
    return { ...service, status: 'error' }
  }
}

export default async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { service } = request.query
  const { dependency } = request.query

  if (service) {
    let response

    switch (service[0]) {
      case Services.GATEWAY:
        response = await checkServiceHealth(SERVICES_TO_CHECK[0])
        break
      case Services.AUTH:
        response = await checkServiceHealth(SERVICES_TO_CHECK[0])
        break
      case Services.SEARCH:
        response = await checkServiceHealth(SERVICES_TO_CHECK[5])
        break
      case Services.USER_MGNT:
        response = await checkServiceHealth(SERVICES_TO_CHECK[1])
        break
      case Services.METRICS:
        response = await checkServiceHealth(SERVICES_TO_CHECK[2])
        break
      case Services.NOTIFICATION:
        response = await checkServiceHealth(SERVICES_TO_CHECK[3])
        break
      case Services.COUNTRY_CONFIG:
        response = await checkServiceHealth(SERVICES_TO_CHECK[4])
        break
      case Services.WORKFLOW:
        response = await checkServiceHealth(SERVICES_TO_CHECK[6])
        break
      default:
        response = await checkServiceHealth(SERVICES_TO_CHECK[0])
    }
    return response
  } else if (dependency) {
    let response

    switch (dependency[0]) {
      case Dependencies.ELASTICSEARCH:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[0])
        break
      case Dependencies.MINIO:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[1])
        break
      case Dependencies.MONGODB:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[2])
        break
      case Dependencies.INFLUXDB:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[3])
        break
      case Dependencies.REDIS:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[4])
        break
      case Dependencies.KIBANA:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[5])
        break
      case Dependencies.OPENHIM:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[6])
        break
      case Dependencies.HEARTH:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[7])
        break
      default:
        response = await getDependencyHealth(DEPENDENCIES_TO_CHECK[0])
    }
    return response
  } else {
    const servicesResponse = await Promise.all(
      SERVICES_TO_CHECK.map(checkServiceHealth)
    )
    const dependenciesResponse = await Promise.all(
      DEPENDENCIES_TO_CHECK.map(getDependencyHealth)
    )
    return { dependencies: dependenciesResponse, services: servicesResponse }
  }
}

export const serviceHealthSchema = Joi.array().items(
  Joi.object({
    name: Joi.string(),
    url: Joi.object(),
    status: Joi.string().valid('error', 'ok')
  }).unknown()
)

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
    .single(),
  dependency: Joi.array()
    .items(
      Joi.string().valid(
        Dependencies.REDIS,
        Dependencies.ELASTICSEARCH,
        Dependencies.INFLUXDB,
        Dependencies.MONGODB,
        Dependencies.MINIO,
        Dependencies.KIBANA,
        Dependencies.OPENHIM,
        Dependencies.HEARTH
      )
    )
    .single()
})
