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
import type * as Hapi from '@hapi/hapi'
import { uniqueId } from 'lodash'
import nodeFetch from 'node-fetch'
import { AllRoutes } from './api-types'

export interface IAuthHeader {
  Authorization: string
  'x-correlation-id'?: string
  'x-real-ip'?: string
  'x-real-user-agent'?: string
}

export function getAuthHeader(request: Hapi.Request) {
  return {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id'] || uniqueId(),
    'x-real-ip': request.headers['x-real-ip'] || request.info?.remoteAddress,
    'x-real-user-agent': request.headers['user-agent']
  }
}

export function joinURL(base: string, path: string) {
  const baseWithSlash = base.endsWith('/') ? base : base + '/'
  return new URL(path, baseWithSlash)
}

export class NotFound extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFound'
  }
}

export async function fetchJSON<ResponseType = any>(
  ...params: Parameters<typeof nodeFetch>
) {
  const res = await nodeFetch(...params)

  if (!res.ok) {
    if (res.status === 404) {
      throw new NotFound(res.statusText)
    }

    throw new Error(res.statusText)
  }

  return res.json() as ResponseType
}

type Services = AllRoutes

const SERVICE_URLS = {
  'user-mgnt': process.env.USER_MANAGEMENT_URL,
  auth: process.env.AUTH_URL,
  config: process.env.CONFIG_URL,
  documents: process.env.DOCUMENTS_URL,
  metrics: process.env.METRICS_URL,
  notification: process.env.NOTIFICATION_SERVICE_URL,
  search: process.env.SEARCH_URL,
  webhooks: process.env.WEBHOOKS_URL,
  workflow: process.env.WORKFLOW_URL
}

export function createServiceClient<ServiceName extends keyof Services>(
  service: ServiceName
) {
  const url = SERVICE_URLS[service]

  if (!url) {
    throw new Error(
      `Missing URL for service ${service}. Make sure you have set the corresponding environment variable`
    )
  }

  type Service = Services[ServiceName]
  function request<
    Method extends keyof Service,
    Path extends keyof Service[Method]
  >(
    method: Method,
    path: Path,
    request: Service[Method][Path] extends { request: infer R } ? R : never
  ) {
    if (!url) {
      throw new Error(
        `Missing URL for service ${service}. Make sure you have set the corresponding environment variable`
      )
    }

    return fetchJSON(joinURL(url, path as string).href, {
      method: (method as string).toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
  }
  return {
    post: <Path extends keyof Service['post']>(
      path: Path,
      payload: Service['post'][Path] extends { request: infer R } ? R : never
    ) => request('post', path, payload),
    get: <Path extends keyof Service['get']>(
      path: Path,
      payload: Service['get'][Path] extends { request: infer R } ? R : never
    ) => request('get', path, payload),
    delete: <Path extends keyof Service['delete']>(
      path: Path,
      payload: Service['delete'][Path] extends { request: infer R } ? R : never
    ) => request('delete', path, payload),
    put: <Path extends keyof Service['put']>(
      path: Path,
      payload: Service['put'][Path] extends { request: infer R } ? R : never
    ) => request('put', path, payload)
  }
}
