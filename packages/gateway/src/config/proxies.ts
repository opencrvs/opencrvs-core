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
import { APPLICATION_CONFIG_URL, AUTH_URL } from '@gateway/constants'
import { rateLimitedRoute } from '@gateway/rate-limit'
import { ServerRoute } from '@hapi/hapi'

export const catchAllProxy = {
  auth: {
    method: 'POST',
    path: '/auth/{suffix}',
    handler: (_, h) =>
      h.proxy({
        uri: AUTH_URL + '/{suffix}'
      }),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  },
  locations: {
    method: '*',
    path: '/location',
    handler: (req, h) =>
      h.proxy({
        uri: `${APPLICATION_CONFIG_URL}locations${req.url.search}`,
        passThrough: true
      }),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  },
  locationId: {
    method: '*',
    path: '/location/{id}',
    handler: (req, h) =>
      h.proxy({
        uri: `${APPLICATION_CONFIG_URL}locations/{id}`,
        passThrough: true
      }),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  }
} satisfies Record<string, ServerRoute>

export const rateLimitedAuthProxy = {
  authenticate: {
    method: 'POST',
    path: '/auth/authenticate',
    handler: rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/authenticate'
        })
    ),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  },
  authenticateSuperUser: {
    method: 'POST',
    path: '/auth/authenticate-super-user',
    handler: rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'username' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/authenticate-super-user'
        })
    ),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  },
  verifyUser: {
    method: 'POST',
    path: '/auth/verifyUser',
    handler: rateLimitedRoute(
      { requestsPerMinute: 10, pathOptionsForKey: ['mobile', 'email'] },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/verifyUser'
        })
    ),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  }
} satisfies Record<string, ServerRoute>
