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
