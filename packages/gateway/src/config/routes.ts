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
import healthCheckHandler from '@gateway/features/healthCheck/handler'
import {
  eventNotificationHandler,
  fhirBundleSchema,
  validationFailedAction
} from '@gateway/features/eventNotification/eventNotificationHandler'
import { ServerRoute } from '@hapi/hapi'
import { catchAllProxy, rateLimitedAuthProxy } from './proxies'
import sendVerifyCodeHandler, {
  requestSchema,
  responseSchema
} from '@gateway/routes/verifyCode/handler'
import authenticateHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from '@gateway/routes/authenticate/handler'
import getPublicKey from '@gateway/routes/getPublicKey/handler'
import resendAuthCodeHandler, {
  requestSchema as reqResendAuthenticationCodeSchema,
  responseSchma as resResendAuthenticationCodeSchema
} from '@gateway/routes/resendAuthenticationCode/handler'
import verifyAuthCodeHandler, {
  requestSchema as reqVerifySchema,
  responseSchma as resVerifySchema
} from '@gateway/routes/verifyAuthCode/handler'
import verifyRefreshTokenHandler, {
  requestSchema as refreshTokenReqSchema,
  responseSchma as refreshTokenResSchema
} from '@gateway/routes/refreshToken/handler'
import invalidateTokenHandler, {
  reqInvalidateTokenSchema
} from '@gateway/routes/invalidateToken/handler'
import verifyUserHandler, {
  requestSchema as reqVerifyUserSchema,
  responseSchema as resVerifyUserSchema
} from '@gateway/routes/verifyUser/handler'
import verifyNumberHandler, {
  requestSchema as reqVerifyNumberSchema,
  responseSchema as resVerifyNumberSchema
} from '@gateway/routes/verifyNumber/handler'
import verifySecurityQuestionHandler, {
  verifySecurityQuestionSchema,
  verifySecurityQuestionResSchema
} from '@gateway/routes/verifySecurityAnswer/handler'
import changePasswordHandler, {
  reqChangePasswordSchema
} from '@gateway/routes/changePassword/handler'
import sendUserNameHandler, {
  requestSchema as reqSendUserNameSchema
} from '@gateway/routes/sendUserName/handler'
import tokenHandler from '@gateway/routes/token/handler'
import { rateLimitedRoute } from '@gateway/rate-limit'

export const getRoutes = () => {
  const routes: ServerRoute[] = [
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: () => {
        return 'success'
      }
    },
    // health check endpoint for all services
    {
      method: 'GET',
      path: '/ping',
      handler: healthCheckHandler,
      options: {
        auth: false,
        description: 'Checks the health of all services.',
        notes: 'Pass the service as a query param: service'
      }
    },
    // create event notification
    {
      method: 'POST',
      path: '/notification',
      handler: eventNotificationHandler,
      options: {
        tags: ['api'],
        description: 'Create a health notification',
        auth: {
          scope: ['declare', 'notification-api']
        },
        validate: {
          payload: fhirBundleSchema,
          failAction: validationFailedAction
        }
      }
    },
    {
      method: 'POST',
      path: '/sendVerifyCode',
      handler: sendVerifyCodeHandler,
      options: {
        description: 'Send verify code to user contact',
        notes:
          'Generate a 6 digit verification code.' +
          'Sends an SMS/email to the user with verification code.',
        validate: {
          payload: requestSchema
        },
        response: {
          schema: responseSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/auth/.well-known',
      handler: getPublicKey,
      options: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/auth/authenticate',
      handler: rateLimitedRoute(
        { requestsPerMinute: 10, pathForKey: 'username' },
        authenticateHandler
      ),
      options: {
        tags: ['api'],
        description: 'Authenticate with username and password',
        notes:
          'Authenticates user and returns nonce to use for collating the login for 2 factor authentication.' +
          'Sends an SMS to the user mobile with verification code',
        validate: {
          payload: reqAuthSchema
        },
        response: {
          schema: resAuthSchema
        },
        auth: false,
        payload: {
          output: 'data',
          parse: true
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/resendAuthenticationCode',
      handler: resendAuthCodeHandler,
      options: {
        tags: ['api'],
        description: 'Resend another authentication code',
        notes:
          'Sends a new authentication code to the user based on the phone number or email associated with the nonce',
        validate: {
          payload: reqResendAuthenticationCodeSchema
        },
        response: {
          schema: resResendAuthenticationCodeSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/verifyCode',
      handler: verifyAuthCodeHandler,
      options: {
        tags: ['api'],
        auth: false,
        description: 'Verify the 2 factor auth code',
        notes:
          'Verifies the 2 factor auth code and returns the JWT API token for future requests',
        validate: {
          payload: reqVerifySchema
        },
        response: {
          schema: resVerifySchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/refreshToken',
      handler: verifyRefreshTokenHandler,
      options: {
        tags: ['api'],
        description: 'Refresh an expiring token',
        notes:
          'Verifies the expired client token as true and returns a refreshed JWT API token for future requests',
        validate: {
          payload: refreshTokenReqSchema
        },
        response: {
          schema: refreshTokenResSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/invalidateToken',
      handler: invalidateTokenHandler,
      options: {
        tags: ['api'],
        description: 'Marks token as invalid until it expires',
        auth: false,
        notes:
          'Adds a token to the invalid tokens stored in Redis, ' +
          'these are stored as individual key value pairs to that we can set their expiry TTL individually',

        validate: {
          payload: reqInvalidateTokenSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/verifyUser',
      handler: rateLimitedRoute(
        { requestsPerMinute: 10, pathOptionsForKey: ['mobile', 'email'] },
        verifyUserHandler
      ),
      options: {
        tags: ['api'],
        description:
          'First step of password or username retrieval steps.' +
          'Check if user exists for given mobile number or not.',
        notes:
          'Verifies user and returns nonce to use for next step of password reset flow.' +
          'Sends an SMS to the user mobile with verification code',
        auth: false,
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
      path: '/auth/verifyNumber',
      handler: verifyNumberHandler,
      options: {
        tags: ['api'],
        auth: false,
        description:
          'Second step of password or username retrieval steps.' +
          'Check if provided verification code is valid or not.',
        notes:
          'Verifies code for given nonce and returns a random security question for that user.',
        validate: {
          payload: reqVerifyNumberSchema
        },
        response: {
          schema: resVerifyNumberSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/verifySecurityAnswer',
      handler: verifySecurityQuestionHandler,
      options: {
        tags: ['api'],
        auth: false,
        description:
          'Third step of password or username retrieval steps.' +
          'Checks if the submitted security question answer is right',
        notes:
          'Verifies security answer and updates the nonce information so that it can be used for changing the password' +
          'In-case of a wrong answer, it will return an another question key.',
        validate: {
          payload: verifySecurityQuestionSchema
        },
        response: {
          schema: verifySecurityQuestionResSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/changePassword',
      handler: changePasswordHandler,
      options: {
        tags: ['api'],
        auth: false,
        description:
          'Final step of password retrieval flow.' +
          'Changes the user password',
        notes:
          'Expects the nonce parameter to be coming from the reset password journey',
        validate: {
          payload: reqChangePasswordSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/sendUserName',
      handler: sendUserNameHandler,
      options: {
        tags: ['api'],
        auth: false,
        description:
          'Final step of username retrieval flow.' +
          'Sends the username to user mobile number',
        notes:
          'Expects the nonce parameter to be coming from the retrieve username journey',
        validate: {
          payload: reqSendUserNameSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/token',
      handler: tokenHandler,
      options: {
        auth: false,
        payload: {
          output: 'data',
          parse: false
        }
      }
    },

    catchAllProxy.locations,
    catchAllProxy.locationsSuffix,

    catchAllProxy.location,
    catchAllProxy.locationId,

    catchAllProxy.auth,
    rateLimitedAuthProxy.authenticateSuperUser
  ]

  return routes
}
