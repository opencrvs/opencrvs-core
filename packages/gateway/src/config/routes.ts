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
import * as glob from 'glob'
import { join, resolve } from 'path'
import healthCheckHandler, {
  querySchema as healthCheckQuerySchema,
  responseSchema as healthCheckResponseSchema
} from '@gateway/features/healthCheck/handler'

export const getRoutes = () => {
  const routes = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },
    // health check endpoint for all services
    {
      method: 'GET',
      path: '/ping',
      handler: healthCheckHandler,
      config: {
        tags: ['api'],
        auth: false,
        description: 'Checks the health of all services.',
        notes: 'Pass the service as a query param: service',
        validate: {
          query: healthCheckQuerySchema
        },
        response: {
          schema: healthCheckResponseSchema
        }
      }
    }
  ]
  // add all routes from all modules to the routes array manually or write your routes inside a folder inside the server folder
  // with suffix as -routes.ts
  glob.sync(join(__dirname, '../routes/**/*-route.[t|j]s')).forEach((file) => {
    routes.push(require(resolve(file)).default)
  })
  return routes
}
