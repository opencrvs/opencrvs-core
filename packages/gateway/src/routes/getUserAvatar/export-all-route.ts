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

import { getUserAvatarHandler } from '@gateway/routes/getUserAvatar/handler'

// curl -H 'Content-Type: application/json' -d '{"username": "test.user", "password": "test"}' http://localhost:4040/sendVerifyCode
export default {
  method: 'GET',
  path: '/files/avatar/{userId}.jpg',
  handler: getUserAvatarHandler,
  config: {
    tags: ['api'],
    auth: false,
    description: 'Get the user avatar as buffer',
    notes: 'Pass the usreId as url param'
  }
}
