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
import fetch from 'node-fetch'
import * as Hapi from '@hapi/hapi'

export const verifyToken = async (token: string, authUrl: string) => {
  const res = await fetch(`${authUrl}/verifyToken`, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const body = await res.json()

  if (body.valid === true) {
    return true
  }

  return false
}

export const validateFunc = async (
  payload: unknown,
  request: Hapi.Request,
  checkInvalidToken: boolean,
  authUrl: string
) => {
  let valid = false
  if (checkInvalidToken) {
    valid = await verifyToken(
      request.headers.authorization.replace('Bearer ', ''),
      authUrl
    )
  }

  if (valid || !checkInvalidToken) {
    return {
      isValid: true,
      credentials: payload
    }
  }

  return {
    isValid: false
  }
}
