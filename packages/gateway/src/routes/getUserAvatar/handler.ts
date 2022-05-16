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
import * as Hapi from '@hapi/hapi'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import fetch from 'node-fetch'
import { resolve } from 'url'

export async function getUserAvatarHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const params = {
    userId: request.params.userId as string
  }
  return await fetch(resolve(USER_MANAGEMENT_URL, 'getUserAvatar'), {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      return response.buffer()
    })
    .catch((error) => {
      return Promise.reject(new Error(` request failed: ${error.message}`))
    })
}
