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
import * as Joi from 'joi'
import { birthEventHandler } from '@search/features/registration/birth/handler'
import { deathEventHandler } from '@search/features/registration/death/handler'
import {
  searchDeclaration,
  getAllDocumentsHandler,
  getStatusWiseRegistrationCountHandler,
  populateHierarchicalLocationIdsHandler
} from '@search/features/search/handler'
import { deduplicateHandler } from '@search/features/registration/deduplicate/handler'
import { assignEventHandler } from '@search/features/registration/assign/handler'

const enum RouteScope {
  DECLARE = 'declare',
  VALIDATE = 'validate',
  REGISTER = 'register',
  SYSADMIN = 'sysadmin',
  CERTIFY = 'certify'
}

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
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    {
      method: 'POST',
      path: '/search',
      handler: searchDeclaration,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        description: 'Handles searching from declarations'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/{eventType}',
      handler: birthEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration and searching for duplicates or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/events/death/{eventType}',
      handler: deathEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/events/not-duplicate',
      handler: deduplicateHandler,
      config: {
        tags: ['api'],
        description: 'Marks the declaration as not a duplicate'
      }
    },
    {
      method: 'POST',
      path: '/events/assigned',
      handler: assignEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new declaration or updating an existing declaration'
      }
    },
    {
      method: 'POST',
      path: '/search/all',
      handler: getAllDocumentsHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        description: 'Returns all the documents in the index'
      }
    },
    {
      method: 'POST',
      path: '/statusWiseRegistrationCount',
      handler: getStatusWiseRegistrationCountHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.SYSADMIN
          ]
        },
        validate: {
          payload: Joi.object({
            declarationLocationHirarchyId: Joi.string(),
            status: Joi.array().required(),
            event: Joi.string()
          })
        },
        description: 'Returns all the documents in the index'
      }
    },
    {
      method: 'POST',
      path: '/populateHierarchicalLocationIds',
      handler: populateHierarchicalLocationIdsHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        description:
          'Populates hierarchical location ids for the legacy indexes'
      }
    }
  ]
  return routes
}
