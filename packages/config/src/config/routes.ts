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
import configHandler, {
  getLoginConfigHandler
} from '@config/handlers/application/applicationConfigHandler'
import getSystems from '@config/handlers/system/systemHandler'
import getForms from '@config/handlers/forms/formsHandler'
import getDashboardQueries from '@config/handlers/dashboardQueries/dashboardQueries'
import { ServerRoute } from '@hapi/hapi'
import * as Joi from 'joi'
import { resolveChildren } from '@config/handlers/locations/children'
import {
  fetchLocationsHandler,
  locationQuerySchema,
  requestParamsSchema,
  createLocationHandler,
  updateLocationHandler,
  updateSchema,
  requestSchema as createLocationReqSchema
} from '@config/handlers/locations/handler'
import { fetchLocationHandler } from '@config/handlers/locations/location'
import { locationHierarchyHandler } from '@config/handlers/locations/hierarchy'
import { SCOPES } from '@opencrvs/commons/authentication'

export default function getRoutes(): ServerRoute[] {
  return [
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request, h) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      options: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    {
      method: 'GET',
      path: '/config',
      handler: configHandler,
      options: {
        auth: {
          scope: [
            SCOPES.CONFIG_UPDATE_ALL,
            SCOPES.USER_DATA_SEEDING,
            SCOPES.SELF_SERVICE_PORTAL
          ]
        },
        tags: ['api'],
        description: 'Retrieve all configuration'
      }
    },
    {
      method: 'GET',
      path: '/publicConfig',
      handler: getLoginConfigHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Retrieve Application configuration'
      }
    },
    {
      method: 'GET',
      path: '/integrationConfig',
      handler: getSystems,
      options: {
        tags: ['api'],
        description: 'Retrieve Application integrations'
      }
    },
    {
      method: 'GET',
      path: '/forms',
      handler: getForms,
      options: {
        tags: ['api'],
        description: 'Retrieve forms'
      }
    },
    {
      method: 'GET',
      path: '/dashboardQueries',
      handler: getDashboardQueries,
      options: {
        tags: ['api'],
        auth: false,
        description: 'Fetch dashboard queries from country config'
      }
    },
    {
      method: 'GET',
      path: '/locations',
      handler: fetchLocationsHandler,
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
      method: 'POST',
      path: '/locations',
      handler: createLocationHandler,
      options: {
        tags: ['api'],
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL, SCOPES.USER_DATA_SEEDING]
        },
        description: 'Create a location',
        validate: {
          payload: createLocationReqSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/locations/{locationId}',
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
    {
      method: 'PUT',
      path: '/locations/{locationId}',
      handler: updateLocationHandler,
      options: {
        tags: ['api'],
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        description: 'Update a location or facility',
        validate: {
          payload: updateSchema,
          params: requestParamsSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/locations/{locationId}/hierarchy',
      handler: locationHierarchyHandler,
      options: {
        tags: ['api'],
        auth: false,
        description: "Get location's hierarchy",
        validate: {
          params: Joi.object({
            locationId: Joi.string().uuid()
          })
        }
      }
    },
    {
      method: 'GET',
      path: '/locations/{locationId}/children',
      handler: resolveChildren,
      options: {
        auth: false,
        tags: ['api'],
        description:
          'Retrieve all the children (multi-level) of a particular location',
        validate: {
          params: Joi.object({
            locationId: Joi.string().uuid()
          })
        }
      }
    }
  ]
}
