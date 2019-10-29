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
  birthRegistrationHandler,
  newBirthRegistrationHandler,
  birthCertifiedHandler
} from '@metrics/features/registration/handler'
import { metricsHandler } from '@metrics/features/registration/metrics/handler'

export const getRoutes = () => {
  const routes = [
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
    },

    // Event receiver routes
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
      path: '/events/birth/mark-registered',
      handler: birthRegistrationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/mark-certified',
      handler: birthCertifiedHandler,
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
    }
  ]
  return routes
}
