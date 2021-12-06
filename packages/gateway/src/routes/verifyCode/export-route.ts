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

import sendVerifyCodeHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from '@gateway/routes/verifyCode/handler'

// curl -H 'Content-Type: application/json' -d '{"username": "test.user", "password": "test"}' http://localhost:4040/sendVerifyCode
export default {
  method: 'POST',
  path: '/sendVerifyCode',
  handler: sendVerifyCodeHandler,
  config: {
    tags: ['api'],
    description: 'Send verify code to user phone number',
    notes:
      'Generate a 6 digit verification code.' +
      'Sends an SMS to the user mobile with verification code.',
    validate: {
      payload: reqAuthSchema
    },
    response: {
      schema: resAuthSchema
    }
  }
}
