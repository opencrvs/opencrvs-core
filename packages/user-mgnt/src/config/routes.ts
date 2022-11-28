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
import activateUser, {
  requestSchema as activateUserRequestSchema
} from '@user-mgnt/features/activateUser/handler'
import changePasswordHandler, {
  changePasswordRequestSchema
} from '@user-mgnt/features/changePassword/handler'
import changeAvatarHandler, {
  changeAvatarRequestSchema
} from '@user-mgnt/features/changeAvatar/handler'
import createUser from '@user-mgnt/features/createUser/handler'
import getRoles, {
  searchRoleSchema
} from '@user-mgnt/features/getRoles/handler'
import getUser, {
  getUserRequestSchema
} from '@user-mgnt/features/getUser/handler'
import getUserMobile, {
  requestSchema as userIdSchema,
  responseSchema as resMobileSchema
} from '@user-mgnt/features/getUserMobile/handler'
import searchUsers, {
  searchSchema
} from '@user-mgnt/features/searchUsers/handler'
import updateUser from '@user-mgnt/features/updateUser/handler'
import {
  requestSchema as userAuditSchema,
  userAuditHandler
} from '@user-mgnt/features/userAudit/handler'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from '@user-mgnt/features/verifyPassword/handler'
import verifyPassByIdHandler, {
  requestSchema as verifyPassByIdRequestSchema,
  responseSchema as verifyPassByIdResponseSchema
} from '@user-mgnt/features/verifyPasswordById/handler'
import verifySecurityAnswer, {
  verifySecurityRequestSchema,
  verifySecurityResponseSchema
} from '@user-mgnt/features/verifySecurityAnswer/handler'
import {
  registerSystem,
  reqRegisterSystemSchema,
  // resSystemSchema,
  deactivateSystem,
  reactivateSystem,
  clientIdSchema,
  verifySystemHandler,
  verifySystemReqSchema,
  verifySystemResSchema,
  getSystemRequestSchema,
  getSystemResponseSchema,
  getSystemHandler,
  getAllSystemsHandler,
  updatePermissions,
  reqUpdateSystemSchema,
  refreshSystemSecretHandler,
  systemSecretRequestSchema,
  resSystemSchema,
  SystemSchema
} from '@user-mgnt/features/system/handler'
import verifyUserHandler, {
  requestSchema as reqVerifyUserSchema,
  responseSchema as resVerifyUserSchema
} from '@user-mgnt/features/verifyUser/handler'
import * as Hapi from '@hapi/hapi'
import resendSMSInviteHandler, {
  requestSchema as resendSMSRequestSchema
} from '@user-mgnt/features/resendSMSInvite/handler'
import usernameSMSReminderHandler, {
  requestSchema as usernameSMSReminderRequestSchema
} from '@user-mgnt/features/usernameSMSReminderInvite/handler'
import changePhoneHandler, {
  changePhoneRequestSchema
} from '@user-mgnt/features/changePhone/handler'
import * as Joi from 'joi'
import { countUsersByLocationHandler } from '@user-mgnt/features/countUsersByLocation/handler'
import getUserAvatar from '@user-mgnt/features/getAvatar/handler'
import resetPasswordSMSHandler, {
  requestSchema as resetPasswordRequestSchema
} from '@user-mgnt/features/resstPassword/handler'

const enum RouteScope {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify',
  PERFORMANCE = 'performance',
  SYSADMIN = 'sysadmin',
  VALIDATE = 'validate',
  RECORDSEARCH = 'recordsearch'
}

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
      path: '/verifyPassword',
      handler: verifyPassHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Verify user password',
        notes: 'Verify account exist and password is correct',
        validate: {
          payload: reqAuthSchema
        },
        response: {
          schema: resAuthSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifyPasswordById',
      handler: verifyPassByIdHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Verify user password',
        notes: 'Verify account exist by id and password is correct',
        validate: {
          payload: verifyPassByIdRequestSchema
        },
        response: {
          schema: verifyPassByIdResponseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifySecurityAnswer',
      handler: verifySecurityAnswer,
      config: {
        auth: false,
        tags: ['api'],
        description:
          'Verifies sent security question answer is correct' +
          'Responses with a new question key for wrong answer',
        validate: {
          payload: verifySecurityRequestSchema
        },
        response: {
          schema: verifySecurityResponseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/changePassword',
      handler: changePasswordHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Change user password',
        notes: 'Verify account exist and change password',
        validate: {
          payload: changePasswordRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'GET',
      path: '/check-token',
      handler: (request: Hapi.Request) => request.auth.credentials
    },
    {
      method: 'POST',
      path: '/changeUserPassword',
      handler: changePasswordHandler,
      config: {
        tags: ['api'],
        description: 'Changes password for logged-in user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: changePasswordRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/changeUserPhone',
      handler: changePhoneHandler,
      config: {
        tags: ['api'],
        description: 'Changes password for logged-in user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: changePhoneRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/changeUserAvatar',
      handler: changeAvatarHandler,
      config: {
        tags: ['api'],
        description: 'Changes avatar for logged-in user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: changeAvatarRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/getUserMobile',
      handler: getUserMobile,
      config: {
        tags: ['api'],
        description: 'Retrieves a user mobile number',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: userIdSchema
        },
        response: {
          schema: resMobileSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/users/{userId}/avatar',
      handler: getUserAvatar,
      config: {
        tags: ['api'],
        description: 'Retrieves a user avatar',
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/searchUsers',
      handler: searchUsers,
      config: {
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: searchSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/getUser',
      handler: getUser,
      config: {
        tags: ['api'],
        description: 'Retrieves a user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE,
            RouteScope.RECORDSEARCH
          ]
        },
        validate: {
          payload: getUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/createUser',
      handler: createUser,
      config: {
        tags: ['api'],
        description: 'Creates a new user',
        auth: {
          scope: [RouteScope.SYSADMIN]
        }
      }
    },
    {
      method: 'POST',
      path: '/updateUser',
      handler: updateUser,
      config: {
        tags: ['api'],
        description: 'Updates an existing user',
        auth: {
          scope: [RouteScope.SYSADMIN]
        }
      }
    },
    {
      method: 'POST',
      path: '/activateUser',
      handler: activateUser,
      config: {
        tags: ['api'],
        description: 'Activate an existing pending user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: activateUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/getRoles',
      handler: getRoles,
      config: {
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: searchRoleSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/verifyUser',
      handler: verifyUserHandler,
      config: {
        auth: false,
        tags: ['api'],
        description:
          'Verify user for given mobile number. Used for password reset flow.',
        notes:
          'As it is a public api, please take necessary caution before using it.',
        validate: {
          payload: reqVerifyUserSchema
        },
        response: {
          schema: resVerifyUserSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auditUser',
      handler: userAuditHandler,
      config: {
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: userAuditSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/resendSMSInvite',
      handler: resendSMSInviteHandler,
      config: {
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: resendSMSRequestSchema
        },
        description:
          'Resend sms for given mobile number and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/usernameSMSReminder',
      handler: usernameSMSReminderHandler,
      config: {
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: usernameSMSReminderRequestSchema
        },
        description:
          'Resend sms for given username and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/resetPasswordSMS',
      handler: resetPasswordSMSHandler,
      config: {
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: resetPasswordRequestSchema
        },
        description:
          'Reset password via sms for given userid and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/registerSystem',
      handler: registerSystem,
      config: {
        tags: ['api'],
        description: 'Creates a new system client',
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: reqRegisterSystemSchema
        },
        response: {
          schema: resSystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/updatePermissions',
      handler: updatePermissions,
      config: {
        tags: ['api'],
        description: 'Update system permissions',
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: reqUpdateSystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deactivateSystem',
      handler: deactivateSystem,
      config: {
        tags: ['api'],
        description: 'Creates a new system client',
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: clientIdSchema
        },
        response: {
          schema: SystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/reactivateSystem',
      handler: reactivateSystem,
      config: {
        tags: ['api'],
        description: 'Creates a new system client',
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: clientIdSchema
        },
        response: {
          schema: SystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifySystem',
      handler: verifySystemHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Verify system',
        notes: 'Verify system exist and access details are correct',
        validate: {
          payload: verifySystemReqSchema
        },
        response: {
          schema: verifySystemResSchema
        }
      }
    },

    {
      method: 'POST',
      path: '/getSystem',
      handler: getSystemHandler,
      config: {
        tags: ['api'],
        description: 'Verify system',
        notes: 'Verify system exist and access details are correct',
        validate: {
          payload: getSystemRequestSchema
        },
        response: {
          schema: getSystemResponseSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/getAllSystems',
      handler: getAllSystemsHandler,
      config: {
        tags: ['api'],
        description: 'Returns all systems'
      }
    },

    {
      method: 'GET',
      path: '/countUsersByLocation',
      handler: countUsersByLocationHandler,
      config: {
        tags: ['api'],
        description: 'Gets count of users group by office ids',
        auth: {
          scope: [
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          query: Joi.object({
            role: Joi.string().required()
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/refreshSystemSecret',
      handler: refreshSystemSecretHandler,
      config: {
        tags: ['api'],
        description: 'Refresh client secret ',
        notes: 'Refresh client secret',
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: systemSecretRequestSchema
        },
        response: {
          schema: resSystemSchema
        }
      }
    }
  ]
  return routes
}
