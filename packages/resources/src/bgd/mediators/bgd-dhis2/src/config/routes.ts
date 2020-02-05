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
import { birthNotificationHandler } from '@bgd-dhis2-mediator/features/notification/birth/handler'
import { deathNotificationHandler } from '@bgd-dhis2-mediator/features/notification/death/handler'

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
        auth: false,
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/dhis2-notification/birth',
      handler: birthNotificationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE] // TODO we need to add a scope for notification and allow API user to be created with this scope
        },
        description:
          'Handles transformation and submission of birth notification'
      }
    },
    {
      method: 'POST',
      path: '/dhis2-notification/death',
      handler: deathNotificationHandler,
      config: {
        tags: ['api'],
        auth: {
          scope: [RouteScope.DECLARE] // TODO we need to add a scope for notification and allow API user to be created with this scope
        },
        description:
          'Handles transformation and submission of death notification'
      }
    }
  ]
  return routes
}
