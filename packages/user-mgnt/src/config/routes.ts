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
import verifyUserHandler, {
  requestSchema as reqVerifyUserSchema,
  responseSchema as resVerifyUserSchema
} from '@user-mgnt/features/verifyUser/handler'
import * as Hapi from '@hapi/hapi'
import resendInviteHandler, {
  requestSchema as resendInviteRequestSchema
} from '@user-mgnt/features/resendInvite/handler'
import usernameReminderHandler, {
  requestSchema as usernameReminderRequestSchema
} from '@user-mgnt/features/usernameSMSReminderInvite/handler'
import changePhoneHandler, {
  changePhoneRequestSchema
} from '@user-mgnt/features/changePhone/handler'
import resetPasswordInviteHandler, {
  requestSchema as resetPasswordRequestSchema
} from '@user-mgnt/features/resetPassword/handler'
import changeEmailHandler, {
  changeEmailRequestSchema
} from '@user-mgnt/features/changeEmail/handler'

import { encodeScope, SCOPES } from '@opencrvs/commons'
import mongoose from 'mongoose'

export const getRoutes = () => {
  return [
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: async (request: any, h: any) => {
        try {
          return {
            success: mongoose.connection.readyState === 1
          }
        } catch (error) {
          return {
            success: false
          }
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
      path: '/verifyPassword',
      handler: verifyPassHandler,
      options: {
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
      options: {
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
      options: {
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
      options: {
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
      options: {
        tags: ['api'],
        description: 'Changes password for logged-in user',
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
      options: {
        tags: ['api'],
        description: 'Changes password for logged-in user',
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
      path: '/changeUserEmail',
      handler: changeEmailHandler,
      options: {
        tags: ['api'],
        description: 'Changes email for logged-in user',
        validate: {
          payload: changeEmailRequestSchema
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
      options: {
        tags: ['api'],
        description: 'Changes avatar for logged-in user',
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
      options: {
        tags: ['api'],
        description: 'Retrieves a user mobile number',
        auth: {
          scope: [
            SCOPES.USER_READ,
            SCOPES.USER_READ_MY_JURISDICTION,
            SCOPES.USER_READ_MY_OFFICE
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
      method: 'POST',
      path: '/searchUsers',
      handler: searchUsers,
      options: {
        auth: {
          scope: [
            encodeScope({ type: 'organisation.read-locations' }),
            encodeScope({
              type: 'organisation.read-locations',
              options: { accessLevel: 'location' }
            }),
            encodeScope({
              type: 'organisation.read-locations',
              options: { accessLevel: 'administrativeArea' }
            }),
            encodeScope({
              type: 'organisation.read-locations',
              options: { accessLevel: 'all' }
            }),
            encodeScope({ type: 'user.data-seeding' })
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
      options: {
        tags: ['api'],
        description: 'Retrieves a user',
        validate: {
          payload: getUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/createUser',
      handler: createUser,
      options: {
        tags: ['api'],
        description: 'Creates a new user',
        auth: {
          scope: [
            SCOPES.USER_CREATE,
            SCOPES.USER_CREATE_MY_JURISDICTION,
            'type=user.data-seeding'
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/updateUser',
      handler: updateUser,
      options: {
        tags: ['api'],
        description: 'Updates an existing user',
        auth: {
          scope: [
            SCOPES.USER_UPDATE,
            SCOPES.USER_UPDATE_MY_JURISDICTION,
            'type=user.data-seeding'
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/activateUser',
      handler: activateUser,
      options: {
        tags: ['api'],
        description: 'Activate an existing pending user',
        validate: {
          payload: activateUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifyUser',
      handler: verifyUserHandler,
      options: {
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
      options: {
        auth: {
          scope: [
            SCOPES.USER_UPDATE,
            SCOPES.USER_UPDATE_MY_JURISDICTION,
            encodeScope({ type: 'user.data-seeding' })
          ]
        },
        validate: {
          payload: userAuditSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/resendInvite',
      handler: resendInviteHandler,
      options: {
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: resendInviteRequestSchema
        },
        description:
          'Resend sms for given mobile number and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/usernameReminder',
      handler: usernameReminderHandler,
      options: {
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: usernameReminderRequestSchema
        },
        description:
          'Resend sms for given username and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/resetPasswordInvite',
      handler: resetPasswordInviteHandler,
      options: {
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: resetPasswordRequestSchema
        },
        description:
          'Reset password via sms for given userid and make the corresponding user pending'
      }
    }
  ] satisfies Hapi.ServerRoute[]
}
