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

import { makeNotificationHandler } from '@countryconfig/api/notification/handler'
import { ReqRefDefaults, ServerRoute } from '@hapi/hapi'

export default function getUserNotificationRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    {
      method: 'POST',
      path: '/triggers/user/user-created',
      handler: makeNotificationHandler('user-created'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for user creation'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/user-updated',
      handler: makeNotificationHandler('user-updated'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for user update'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/username-reminder',
      handler: makeNotificationHandler('username-reminder'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for username reminder'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/reset-password',
      handler: makeNotificationHandler('reset-password'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for password reset'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/reset-password-by-admin',
      handler: makeNotificationHandler('reset-password-by-admin'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for admin password reset'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/resend-invite',
      handler: makeNotificationHandler('resend-invite'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for resent user invite'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/2fa',
      handler: makeNotificationHandler('2fa'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles notification for two-factor authentication code'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/all-user-notification',
      handler: makeNotificationHandler('all-user-notification'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles broadcast for all user '
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/change-phone-number',
      handler: makeNotificationHandler('change-phone-number'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles verification for phone number change'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/change-email-address',
      handler: makeNotificationHandler('change-email-address'),
      options: {
        auth: false,
        tags: ['api'],
        description: 'Handles verification for email address change'
      }
    }
  ]
}
