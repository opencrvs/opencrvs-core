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

/*
 * Only core sends `/trigger/user/*`: the auth service for its pre-authentication
 * flows (2fa, reset-password, recovery links, username reminder), the events
 * service for user management and the announcement worker for broadcasts.
 * `auth: 'core'` accepts only those signed requests, so nobody else can trigger
 * 2FA codes, password reset links or notifications to arbitrary recipients.
 */
export default function getUserNotificationRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    {
      method: 'POST',
      path: '/trigger/user/user-created',
      handler: makeNotificationHandler('user-created'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for user creation'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/user-updated',
      handler: makeNotificationHandler('user-updated'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for user update'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/username-reminder',
      handler: makeNotificationHandler('username-reminder'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for username reminder'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/reset-password',
      handler: makeNotificationHandler('reset-password'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for password reset'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/reset-password-by-admin',
      handler: makeNotificationHandler('reset-password-by-admin'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for admin password reset'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/password-reset-link',
      handler: makeNotificationHandler('password-reset-link'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for password reset recovery link'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/username-reminder-link',
      handler: makeNotificationHandler('username-reminder-link'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for username reminder recovery link'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/resend-invite',
      handler: makeNotificationHandler('resend-invite'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for resent user invite'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/2fa',
      handler: makeNotificationHandler('2fa'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles notification for two-factor authentication code'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/all-user-notification',
      handler: makeNotificationHandler('all-user-notification'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles broadcast for all user '
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/change-phone-number',
      handler: makeNotificationHandler('change-phone-number'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles verification for phone number change'
      }
    },
    {
      method: 'POST',
      path: '/trigger/user/change-email-address',
      handler: makeNotificationHandler('change-email-address'),
      options: {
        auth: 'core',
        tags: ['api'],
        description: 'Handles verification for email address change'
      }
    }
  ]
}
