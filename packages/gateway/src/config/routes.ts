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
import { DOCUMENTS_URL } from '@gateway/constants'
import {
  configHandler,
  publicConfigHandler
} from '@gateway/features/config/configHandler'
import { dashboardQueriesHandler } from '@gateway/features/config/dashboardQueriesHandler'
import { formsHandler } from '@gateway/features/config/formsHandler'
import healthCheckHandler from '@gateway/features/healthCheck/handler'
import sendVerifyCodeHandler, {
  requestSchema,
  responseSchema
} from '@gateway/routes/verifyCode/handler'
import { trpcProxy } from '@gateway/v2-events/event-config/routes'
import { ServerRoute } from '@hapi/hapi'
import { authProxy, catchAllProxy, rateLimitedAuthProxy } from './proxies'

export const getRoutes = () => {
  const routes: ServerRoute[] = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: () => {
        return 'success'
      }
    },
    // health check endpoint for all services
    {
      method: 'GET',
      path: '/ping',
      handler: healthCheckHandler,
      options: {
        auth: false,
        description: 'Checks the health of all services.',
        notes: 'Pass the service as a query param: service'
      }
    },
    {
      method: 'POST',
      path: '/sendVerifyCode',
      handler: sendVerifyCodeHandler,
      options: {
        description: 'Send verify code to user contact',
        notes:
          'Generate a 6 digit verification code.' +
          'Sends an SMS/email to the user with verification code.',
        validate: {
          payload: requestSchema
        },
        response: {
          schema: responseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/upload',
      handler: async (req, h) => {
        return h.proxy({
          uri: `${DOCUMENTS_URL}/files`,
          passThrough: true
        })
      },
      options: {
        payload: {
          output: 'data',
          parse: false
        }
      }
    },
    {
      method: 'GET',
      path: '/presigned-url/{filePath*}',
      handler: async (req, h) => {
        return h.proxy({
          uri: `${DOCUMENTS_URL}/presigned-url/${req.params.filePath}`,
          passThrough: true
        })
      }
    },
    {
      method: 'DELETE',
      path: '/files/{filePath*}',
      handler: async (req, h) => {
        return h.proxy({
          uri: `${DOCUMENTS_URL}/files/${req.params.filePath}`,
          passThrough: true
        })
      },
      options: {
        payload: {
          output: 'data',
          parse: false
        }
      }
    },
    // application config routes (moved from config service)
    {
      method: 'GET',
      path: '/config',
      handler: configHandler,
      options: {
        tags: ['api'],
        description: 'Retrieve all configuration'
      }
    },
    {
      method: 'GET',
      path: '/publicConfig',
      handler: publicConfigHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Retrieve application configuration'
      }
    },
    {
      method: 'GET',
      path: '/forms',
      handler: formsHandler,
      options: {
        tags: ['api'],
        description: 'Retrieve forms'
      }
    },
    {
      method: 'GET',
      path: '/dashboardQueries',
      handler: dashboardQueriesHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Fetch dashboard queries from country config'
      }
    },
    catchAllProxy.auth,
    authProxy.token,
    rateLimitedAuthProxy.authenticate,
    rateLimitedAuthProxy.authenticateSuperUser,
    rateLimitedAuthProxy.verifyUser,
    ...trpcProxy
  ]

  return routes
}
