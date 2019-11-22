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
import {
  inProgressBirthRegistrationHandler,
  markBirthRegisteredHandler,
  newBirthRegistrationHandler,
  markCertifiedHandler,
  markValidatedHandler,
  baseHandler,
  markDeathRegisteredHandler
} from '@metrics/features/registration/handler'
import { metricsHandler } from '@metrics/features/registration/metrics/handler'

export const getRoutes = () => {
  const routes = [
    // In progress declaration
    {
      method: 'POST',
      path: '/events/birth/in-progress-declaration',
      handler: inProgressBirthRegistrationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/in-progress-declaration',
      handler: baseHandler,
      config: {
        tags: ['api']
      }
    },

    // New declaration
    {
      method: 'POST',
      path: '/events/birth/new-declaration',
      handler: baseHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-declaration',
      handler: baseHandler,
      config: {
        tags: ['api']
      }
    },

    // New registration
    {
      method: 'POST',
      path: '/events/birth/new-registration',
      handler: newBirthRegistrationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-registration',
      handler: baseHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark validated
    {
      method: 'POST',
      path: '/events/birth/mark-validated',
      handler: markValidatedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-validated',
      handler: markValidatedHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark registered
    {
      method: 'POST',
      path: '/events/birth/mark-registered',
      handler: markBirthRegisteredHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-registered',
      handler: markDeathRegisteredHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark certified
    {
      method: 'POST',
      path: '/events/birth/mark-certified',
      handler: markCertifiedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-certified',
      handler: markCertifiedHandler,
      config: {
        tags: ['api']
      }
    },

    // Metrics query API
    {
      method: 'GET',
      path: '/metrics/birth',
      handler: metricsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        return 'pong'
      },
      config: {
        tags: ['api']
      }
    }
  ]
  return routes
}
