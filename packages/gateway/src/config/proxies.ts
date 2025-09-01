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
/* eslint-disable import/no-named-as-default-member */
import { APPLICATION_CONFIG_URL, AUTH_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { rateLimitedRoute } from '@gateway/rate-limit'
import { api } from '@gateway/v2-events/events/service'
import z from 'zod'
import { ServerRoute } from '@hapi/hapi'

const LegacyLocationUpdate = z.object({
  name: z.string(),
  alias: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  statistics: z
    .array(
      z.object({
        year: z.number(),
        male_population: z.number(),
        female_population: z.number(),
        population: z.number(),
        crude_birth_rate: z.number()
      })
    )
    .optional()
})

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
  /** @deprecated old naming strategy from Hearth.
   * These are included for backwards compability but `locationS` should be preferred */
  location: {
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
  /** @deprecated old naming strategy */
  locationId: {
    method: '*',
    path: '/location/{id}',
    handler: (_, h) =>
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
  },
  getLocations: {
    method: 'GET',
    path: '/locations',
    handler: (req, h) =>
      h.proxy({
        uri: `${APPLICATION_CONFIG_URL}locations${req.url.search}`,
        passThrough: true
      }),
    options: {
      auth: false
    }
  },
  updateLocations: {
    method: 'PUT',
    path: '/locations/{id}',
    handler: async (req, h) => {
      const parseResult = LegacyLocationUpdate.safeParse(req.payload)

      if (!parseResult.success) {
        return h.response().code(400)
      }

      const body = parseResult.data

      const response = await fetch(
        `${APPLICATION_CONFIG_URL}locations/${req.params.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization || ''
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        return h.response().code(response.status)
      }

      await api.locations.sync.mutate(undefined, {
        context: {
          headers: {
            Authorization: req.headers.authorization
          }
        }
      })

      return h.response(response.body).code(response.status)
    },
    options: {
      auth: false
    }
  },
  createLocations: {
    method: 'POST',
    path: '/locations',
    handler: async (req, h) => {
      const body = req.payload

      const response = await fetch(`${APPLICATION_CONFIG_URL}locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.authorization || ''
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        return h.response({}).code(response.status)
      }

      await api.locations.sync.mutate(undefined, {
        context: {
          headers: {
            Authorization: req.headers.authorization
          }
        }
      })

      return h.response({}).code(response.status)
    },
    options: {
      auth: false
    }
  },
  locationsSuffix: {
    method: '*',
    path: '/locations/{suffix}',
    handler: (_, h) =>
      h.proxy({
        uri: `${APPLICATION_CONFIG_URL}locations/{suffix}`,
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
