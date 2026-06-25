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

import { AUTH_URL } from '@gateway/constants'
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
  }
} satisfies Record<string, ServerRoute>

export const authProxy = {
  token: {
    method: 'POST',
    path: '/auth/token',
    handler: (req, h) =>
      h.proxy({
        uri: AUTH_URL + `/token${req.url.search}`
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
      // Super user auth only sends a password, so there's no per-user field to
      // key on — rate limit all super user attempts on a shared constant key.
      { requestsPerMinute: 10, staticKey: 'authenticate-super-user' },
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
  },
  verifyCode: {
    method: 'POST',
    path: '/auth/verifyCode',
    handler: rateLimitedRoute(
      // Key on the nonce so OTP brute-force is capped per login attempt.
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/verifyCode'
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
  resendAuthenticationCode: {
    method: 'POST',
    path: '/auth/resendAuthenticationCode',
    handler: rateLimitedRoute(
      // Key on the nonce to stop OTP message flooding (DoS) per login attempt.
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/resendAuthenticationCode'
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
  // Password/username retrieval flow. Every step keys on the nonce minted by
  // verifyUser, so brute-force and SMS flooding are capped per retrieval attempt.
  verifyNumber: {
    method: 'POST',
    path: '/auth/verifyNumber',
    handler: rateLimitedRoute(
      // OTP brute-force vector — the retrieval-flow twin of verifyCode.
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/verifyNumber'
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
  verifySecurityAnswer: {
    method: 'POST',
    path: '/auth/verifySecurityAnswer',
    handler: rateLimitedRoute(
      // Security-answer brute-force vector.
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/verifySecurityAnswer'
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
  sendUserName: {
    method: 'POST',
    path: '/auth/sendUserName',
    handler: rateLimitedRoute(
      // Sends an SMS per call — cap to prevent message flooding (DoS).
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/sendUserName'
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
  changePassword: {
    method: 'POST',
    path: '/auth/changePassword',
    handler: rateLimitedRoute(
      { requestsPerMinute: 10, pathForKey: 'nonce' },
      (_, h) =>
        h.proxy({
          uri: AUTH_URL + '/changePassword'
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
