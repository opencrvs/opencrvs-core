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
  sendBirthDeclarationConfirmation,
  sendBirthRegistrationConfirmation,
  sendBirthRejectionConfirmation,
  inProgressNotificationSchema,
  declarationNotificationSchema,
  registrationNotificationSchema,
  rejectionNotificationSchema,
  sendBirthInProgressConfirmation
} from '@notification/features/sms/birth-handler'
import {
  sendDeathDeclarationConfirmation,
  sendDeathRegistrationConfirmation,
  sendDeathRejectionConfirmation,
  sendDeathInProgressConfirmation
} from '@notification/features/sms/death-handler'
import {
  sendUserCredentials,
  retrieveUserName,
  updateUserName,
  sendUserAuthenticationCode,
  userCredentialsNotificationSchema,
  retrieveUserNameNotificationSchema,
  authCodeNotificationSchema
} from '@notification/features/sms/user-handler'

const enum RouteScope {
  DECLARE = 'declare',
  VALIDATE = 'validate',
  REGISTER = 'register',
  CERTIFY = 'certify',
  SYSADMIN = 'sysadmin'
}

export default function getRoutes() {
  return [
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
      path: '/authenticationCode',
      handler: sendUserAuthenticationCode,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user with auth code',
        validate: {
          payload: authCodeNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/birthInProgressSMS',
      handler: sendBirthInProgressConfirmation,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user for birth in-progress entry',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY
          ]
        },
        validate: {
          payload: inProgressNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/birthDeclarationSMS',
      handler: sendBirthDeclarationConfirmation,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user for birth declaration entry',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY
          ]
        },
        validate: {
          payload: declarationNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/birthRegistrationSMS',
      handler: sendBirthRegistrationConfirmation,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user for birth registration entry',
        auth: {
          scope: [RouteScope.REGISTER]
        },
        validate: {
          payload: registrationNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/birthRejectionSMS',
      handler: sendBirthRejectionConfirmation,
      config: {
        tags: ['api'],
        description:
          'Sends an sms to a user for birth declaration rejection entry',
        auth: {
          scope: [RouteScope.VALIDATE, RouteScope.REGISTER]
        },
        validate: {
          payload: rejectionNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deathInProgressSMS',
      handler: sendDeathInProgressConfirmation,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user for death in-progress entry',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY
          ]
        },
        validate: {
          payload: inProgressNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deathDeclarationSMS',
      handler: sendDeathDeclarationConfirmation,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user for death declaration entry',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.VALIDATE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY
          ]
        },
        validate: {
          payload: declarationNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deathRegistrationSMS',
      handler: sendDeathRegistrationConfirmation,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user for death registration entry',
        auth: {
          scope: [RouteScope.REGISTER]
        },
        validate: {
          payload: registrationNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deathRejectionSMS',
      handler: sendDeathRejectionConfirmation,
      config: {
        tags: ['api'],
        description:
          'Sends an sms to a user for death declaration rejection entry',
        auth: {
          scope: [RouteScope.VALIDATE, RouteScope.REGISTER]
        },
        validate: {
          payload: rejectionNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/userCredentialsSMS',
      handler: sendUserCredentials,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user with credentials',
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: userCredentialsNotificationSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/retrieveUserNameSMS',
      handler: retrieveUserName,
      config: {
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
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user with new username',
        validate: {
          payload: retrieveUserNameNotificationSchema
        }
      }
    }
  ]
}
