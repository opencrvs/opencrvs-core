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

import {
  subscribeWebhooksHandler,
  reqSubscribeWebhookSchema,
  listWebhooksHandler,
  deleteWebhookHandler
} from '@webhooks/features/manage/handler'
import { birthRegisteredHandler } from '@webhooks/features/event/handler'

export const getRoutes = () => {
  const routes = [
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
      path: '/webhooks',
      handler: subscribeWebhooksHandler,
      config: {
        tags: ['api'],
        description: 'Subscribe to a webhook',
        validate: {
          payload: reqSubscribeWebhookSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/webhooks',
      handler: listWebhooksHandler,
      config: {
        tags: ['api'],
        description: 'List webhooks'
      }
    },
    {
      method: 'DELETE',
      path: '/webhooks/{webhookId}',
      handler: deleteWebhookHandler,
      config: {
        tags: ['api'],
        description: 'Delete webhooks'
      }
    },
    {
      method: 'POST',
      path: '/events/birth/mark-registered',
      handler: birthRegisteredHandler,
      config: {
        tags: ['api'],
        description: 'Dispatches a webhook for the birth registration event'
      }
    }
  ]
  return routes
}
