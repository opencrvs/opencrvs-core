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
 * All `/triggers/user/*` routes below inherit the default JWT auth strategy
 * (see `server.auth.default('jwt')` in index.ts). Every core caller forwards a
 * token whose audience includes `opencrvs:countryconfig-user`:
 *   - the events service forwards the acting user's token (user tokens carry
 *     that audience);
 *   - the auth service pre-authentication flows (2fa, reset-password,
 *     password/username recovery links, username reminder) mint or forward a
 *     token minted with the `opencrvs:countryconfig-user` audience.
 * Leaving them unauthenticated would let anyone trigger 2FA codes, password
 * reset links and notification emails/SMS to arbitrary recipients.
 *
 * `all-user-notification` is dispatched by the background announcement worker,
 * which has no acting user; it forwards a service token (whose audience
 * includes `opencrvs:countryconfig-user`) so this route can be authenticated
 * too.
 */
export default function getUserNotificationRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    {
      method: 'POST',
      path: '/triggers/user/user-created',
      handler: makeNotificationHandler('user-created'),
      options: {
        tags: ['api'],
        description: 'Handles notification for user creation'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/user-updated',
      handler: makeNotificationHandler('user-updated'),
      options: {
        tags: ['api'],
        description: 'Handles notification for user update'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/username-reminder',
      handler: makeNotificationHandler('username-reminder'),
      options: {
        tags: ['api'],
        description: 'Handles notification for username reminder'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/reset-password',
      handler: makeNotificationHandler('reset-password'),
      options: {
        tags: ['api'],
        description: 'Handles notification for password reset'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/reset-password-by-admin',
      handler: makeNotificationHandler('reset-password-by-admin'),
      options: {
        tags: ['api'],
        description: 'Handles notification for admin password reset'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/password-reset-link',
      handler: makeNotificationHandler('password-reset-link'),
      options: {
        tags: ['api'],
        description: 'Handles notification for password reset recovery link'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/username-reminder-link',
      handler: makeNotificationHandler('username-reminder-link'),
      options: {
        tags: ['api'],
        description: 'Handles notification for username reminder recovery link'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/resend-invite',
      handler: makeNotificationHandler('resend-invite'),
      options: {
        tags: ['api'],
        description: 'Handles notification for resent user invite'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/2fa',
      handler: makeNotificationHandler('2fa'),
      options: {
        tags: ['api'],
        description: 'Handles notification for two-factor authentication code'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/all-user-notification',
      handler: makeNotificationHandler('all-user-notification'),
      options: {
        tags: ['api'],
        description: 'Handles broadcast for all user '
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/change-phone-number',
      handler: makeNotificationHandler('change-phone-number'),
      options: {
        tags: ['api'],
        description: 'Handles verification for phone number change'
      }
    },
    {
      method: 'POST',
      path: '/triggers/user/change-email-address',
      handler: makeNotificationHandler('change-email-address'),
      options: {
        tags: ['api'],
        description: 'Handles verification for email address change'
      }
    }
  ]
}
