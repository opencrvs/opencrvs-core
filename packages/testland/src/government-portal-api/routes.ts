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
import { GATEWAY_URL } from '@countryconfig/constants'
import {
  createAuthenticatedProxyHandler,
  createCorsOptionsHandler
} from './proxy-auth-handler'
import { notificationsHandler } from './notifications-handler'

export function getGovernmentPortalApiRoutes(): Hapi.ServerRoute[] {
  return [
    {
      method: 'OPTIONS',
      path: '/api/upload',
      handler: createCorsOptionsHandler(),
      options: {
        auth: false,
        tags: ['api', 'proxy', 'cors']
      }
    },
    {
      method: '*',
      path: '/api/upload',
      handler: createAuthenticatedProxyHandler(`${GATEWAY_URL}/upload`, true),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false,
          maxBytes: 52428800
        },
        tags: ['api', 'proxy'],
        description:
          'Proxy for gateway upload endpoint with system authentication'
      }
    },
    {
      method: 'OPTIONS',
      path: '/api/events/{path*}',
      handler: createCorsOptionsHandler(),
      options: {
        auth: false,
        tags: ['api', 'proxy', 'cors']
      }
    },
    {
      method: 'OPTIONS',
      path: '/api/events/notifications',
      handler: createCorsOptionsHandler(),
      options: {
        auth: false,
        tags: ['api', 'notifications', 'cors']
      }
    },
    {
      method: 'POST',
      path: '/api/events/notifications',
      handler: notificationsHandler,
      options: {
        auth: false,
        tags: ['api', 'notifications'],
        description:
          'Finds CRVS office based on birth location administrativeAreaId'
      }
    },
    {
      method: 'GET',
      path: '/api/events/{path*}',
      handler: createAuthenticatedProxyHandler(
        (request) =>
          `${GATEWAY_URL}/events${request.params.path ? '/' + request.params.path : ''}`,
        true
      ),
      options: {
        auth: false,
        tags: ['api', 'proxy'],
        description:
          'Proxy for gateway events endpoint with system authentication'
      }
    },
    {
      method: '*',
      path: '/api/events/{path*}',
      handler: createAuthenticatedProxyHandler(
        (request) =>
          `${GATEWAY_URL}/events${request.params.path ? '/' + request.params.path : ''}`,
        true
      ),
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        },
        tags: ['api', 'proxy'],
        description:
          'Proxy for gateway events endpoint with system authentication'
      }
    }
  ]
}
