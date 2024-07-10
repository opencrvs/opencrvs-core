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
