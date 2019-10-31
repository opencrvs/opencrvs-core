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
import { birthEventHandler } from '@search/features/registration/birth/handler'
import { deathEventHandler } from '@search/features/registration/death/handler'
import { searchDeclaration } from '@search/features/search/handler'

const enum RouteScope {
  DECLARE = 'declare',
  VALIDATE = 'validate',
  REGISTER = 'register',
  CERTIFY = 'certify'
}

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
    {
      method: 'POST',
      path: '/search',
      handler: searchDeclaration,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE, RouteScope.VALIDATE, RouteScope.REGISTER]
        },
        description: 'Handles searching from applications'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/{eventType}',
      handler: birthEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new application and searching for duplicates or updating an existing application'
      }
    },
    {
      method: 'POST',
      path: '/events/death/{eventType}',
      handler: deathEventHandler,
      config: {
        tags: ['api'],
        description:
          'Handles indexing a new application or updating an existing application'
      }
    }
  ]
  return routes
}
