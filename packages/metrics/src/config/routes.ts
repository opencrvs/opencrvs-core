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

import {
  getUserAuditsHandler,
  newAuditHandler
} from '@metrics/features/audit/handler'
import * as Joi from 'joi'

import * as Hapi from '@hapi/hapi'

export enum EventType {
  BIRTH = 'birth',
  DEATH = 'death',
  MARRIAGE = 'marriage'
}


export const getRoutes = () => {
  const routes: Hapi.ServerRoute[] = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      options: {
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
      options: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    // new Audit handler
    {
      method: 'POST',
      path: '/audit/events',
      handler: newAuditHandler,
      options: {
        tags: ['api'],
        auth: false
      }
    },
    // GET user audit events
    {
      method: 'GET',
      path: '/audit/events',
      handler: getUserAuditsHandler,
      options: {
        validate: {
          query: Joi.object({
            practitionerId: Joi.string().required(),
            skip: Joi.number(),
            count: Joi.number(),
            timeStart: Joi.string(),
            timeEnd: Joi.string()
          })
        },
        tags: ['api']
      }
    }
  ]
  return routes
}
