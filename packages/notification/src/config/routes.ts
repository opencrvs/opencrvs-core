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
  allUsersEmailHandler,
  allUsersEmailPayloadSchema
} from '@notification/features/email/all-user-handler'
import {
  sendCorrectionApprovedNotification,
  sendCorrectionApprovedNotificationInput,
  sendCorrectionRejectedNotification,
  sendCorrectionRejectedNotificationInput
} from '@notification/features/sms/correction'
import {
  sendUserCredentials,
  retrieveUserName,
  updateUserName,
  sendUserAuthenticationCode,
  userCredentialsNotificationSchema,
  retrieveUserNameNotificationSchema,
  authCodeNotificationSchema,
  sendResetPasswordInvite,
  userPasswordResetNotificationSchema
} from '@notification/features/sms/user-handler'
import { ServerRoute, ReqRefDefaults, RouteOptionsValidate } from '@hapi/hapi'
import * as Joi from 'joi'
import {
  birthInProgressNotification,
  deathInProgressNotification
} from '@notification/features/inProgress/handler'
import {
  birthReadyForReviewNotification,
  deathReadyForReviewNotification
} from '@notification/features/readyForReview/handler'
import {
  birthRegisterNotification,
  deathRegisterNotification
} from '@notification/features/register/handler'
import {
  birthSentForUpdatesNotification,
  deathSentForUpdatesNotification
} from '@notification/features/sentForUpdates/handler'
import { SCOPES } from '@opencrvs/commons/authentication'

const recordValidation: RouteOptionsValidate = {
  payload: Joi.object()
}

export default function getRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request, h) => {
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
    {
      method: 'POST',
      path: '/authenticationCode',
      handler: sendUserAuthenticationCode,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with auth code',
        validate: {
          payload: authCodeNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/birth/sent-notification',
      handler: birthInProgressNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country-config for birth in-progress declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/death/sent-notification',
      handler: deathInProgressNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country-config for death in-progress declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/birth/sent-notification-for-review',
      handler: birthReadyForReviewNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country-config for birth ready for review declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/death/sent-notification-for-review',
      handler: deathReadyForReviewNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country-config for death ready for review declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/birth/sent-for-approval',
      handler: birthReadyForReviewNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country-config for validated birth declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/death/sent-for-approval',
      handler: deathReadyForReviewNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country-config for validated death declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/birth/registered',
      handler: birthRegisterNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country config for birth register declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/death/registered',
      handler: deathRegisterNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country config for death register declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/birth/sent-for-updates',
      handler: birthSentForUpdatesNotification,
      options: {
        tags: ['api'],
        description:
          'Sends a notification to country config for rejected birth declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/death/sent-for-updates',
      handler: deathSentForUpdatesNotification,
      options: {
        auth: {
          scope: [SCOPES.RECORD_SUBMIT_FOR_UPDATES]
        },
        tags: ['api'],
        description:
          'Sends a notification to country config for rejected death declaration',
        validate: recordValidation
      }
    },
    {
      method: 'POST',
      path: '/userCredentialsInvite',
      handler: sendUserCredentials,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with credentials',
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: userCredentialsNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/rejectCorrectionRequest',
      handler: sendCorrectionRejectedNotification,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with credentials',
        auth: {
          scope: [SCOPES.RECORD_REGISTER]
        },
        validate: {
          payload: sendCorrectionRejectedNotificationInput
        }
      }
    },
    {
      method: 'POST',
      path: '/approveCorrectionRequest',
      handler: sendCorrectionApprovedNotification,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with credentials',
        auth: {
          scope: [SCOPES.RECORD_REGISTER]
        },
        validate: {
          payload: sendCorrectionApprovedNotificationInput
        }
      }
    },
    {
      method: 'POST',
      path: '/resetPasswordInvite',
      handler: sendResetPasswordInvite,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with new temporary password',
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: userPasswordResetNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/retrieveUserName',
      handler: retrieveUserName,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with username',
        validate: {
          payload: retrieveUserNameNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/updateUserNameSMS',
      handler: updateUserName,
      options: {
        tags: ['api'],
        description: 'Sends an sms to a user with new username',
        validate: {
          payload: retrieveUserNameNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/allUsersEmail',
      handler: allUsersEmailHandler,
      options: {
        tags: ['api'],
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        description: 'Sends emails to all users given in payload',
        validate: {
          payload: allUsersEmailPayloadSchema
        }
      }
    }
  ]
}
