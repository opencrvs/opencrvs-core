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
import * as path from 'path'
import healthCheckHandler, {
  querySchema as healthCheckQuerySchema,
  responseSchema as healthCheckResponseSchema
} from '@gateway/features/healthCheck/handler'

export const getRoutes = () => {
  // add ping route by default for health check
  const routes = [
    {
      method: 'GET',
      path: '/ping',
      handler: healthCheckHandler,
      options: {
        tags: ['api'],
        auth: false,
        description: 'Checks the health of all services.',
        notes: 'Pass the service as a querey param: name',
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
  glob.sync('./routes/**/*-route.ts').forEach(file => {
    routes.push(require(path.resolve(file)))
  })
  return routes
}
