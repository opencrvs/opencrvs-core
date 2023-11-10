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
import * as glob from 'glob'
import { join, resolve } from 'path'
import healthCheckHandler from '@gateway/features/healthCheck/handler'
import {
  createLocationHandler,
  requestSchema,
  updateLocationHandler,
  updateSchema,
  fetchLocationHandler,
  requestParamsSchema,
  locationQuerySchema
} from '@gateway/features/restLocation/locationHandler'
import {
  eventNotificationHandler,
  fhirBundleSchema,
  validationFailedAction
} from '@gateway/features/eventNotification/eventNotificationHandler'
import { ServerRoute } from '@hapi/hapi'

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
    // get all locations
    {
      method: 'GET',
      path: '/location',
      handler: fetchLocationHandler,
      options: {
        tags: ['api'],
        auth: false,
        description: 'Get all locations',
        validate: {
          query: locationQuerySchema
        }
      }
    },
    {
      method: 'GET',
      path: '/location/{locationId}',
      handler: fetchLocationHandler,
      options: {
        tags: ['api'],
        auth: false,
        description: 'Get a single location',
        validate: {
          params: requestParamsSchema
        }
      }
    },
    // create Location/Facility
    {
      method: 'POST',
      path: '/location',
      handler: createLocationHandler,
      options: {
        tags: ['api'],
        auth: {
          scope: ['natlsysadmin']
        },
        description: 'Create a location',
        validate: {
          payload: requestSchema
        }
      }
    },
    // update Location/Facility
    {
      method: 'PUT',
      path: '/location/{locationId}',
      handler: updateLocationHandler,
      options: {
        tags: ['api'],
        auth: {
          scope: ['natlsysadmin']
        },
        description: 'Update a location or facility',
        validate: {
          payload: updateSchema,
          params: requestParamsSchema
        }
      }
    },
    // create event notification
    {
      method: 'POST',
      path: '/notification',
      handler: eventNotificationHandler,
      options: {
        tags: ['api'],
        description: 'Create a health notification',
        auth: {
          scope: ['declare', 'notification-api']
        },
        validate: {
          payload: fhirBundleSchema,
          failAction: validationFailedAction
        }
      }
    }
  ]
  // add all routes from all modules to the routes array manually or write your routes inside a folder inside the server folder
  // with suffix as -routes.ts
  glob.sync(join(__dirname, '../routes/**/*-route.[t|j]s')).forEach((file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    routes.push(require(resolve(file)).default)
  })
  return routes
}
