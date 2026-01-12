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
    }
  ]
}
