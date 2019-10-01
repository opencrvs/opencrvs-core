import { smsHandler, requestSchema } from '@notification/features/sms/handler'
import {
  sendBirthDeclarationConfirmation,
  sendBirthRegistrationConfirmation,
  sendBirthRejectionConfirmation,
  declarationNotificationSchema,
  registrationNotificationSchema,
  rejectionNotificationSchema
} from '@notification/features/sms/birth-handler'
import {
  sendDeathDeclarationConfirmation,
  sendDeathRegistrationConfirmation,
  sendDeathRejectionConfirmation
} from '@notification/features/sms/death-handler'
import {
  sendUserCredentials,
  retrieveUserName,
  userCredentialsNotificationSchema,
  retrieveUserNameNotificationSchema
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
    /* add ping route by default for health check */
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        return 'pong'
      },
      config: {
        tags: ['api'],
        auth: false
      }
    },
    /* curl -H 'Content-Type: application/json' -d '{"msisdn": "+27855555555", "message": "Test"}' http://localhost:2020/sms */
    {
      method: 'POST',
      path: '/sms',
      handler: smsHandler,
      config: {
        tags: ['api'],
        description: 'Sends an sms to a user',
        validate: {
          payload: requestSchema
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
          'Sends an sms to a user for birth application rejection entry',
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
          'Sends an sms to a user for death application rejection entry',
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
    }
  ]
}
