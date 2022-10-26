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
import decode from 'jwt-decode'
import * as Sentry from '@sentry/browser'

export const ERROR_CODE_TOO_MANY_ATTEMPTS = 429
export const ERROR_CODE_FIELD_MISSING = 500
export const ERROR_CODE_INVALID_CREDENTIALS = 401
export const ERROR_CODE_FORBIDDEN_CREDENTIALS = 403
export const ERROR_CODE_PHONE_NUMBER_VALIDATE = 503
export interface IURLParams {
  [key: string]: string | string[] | undefined
}
export interface ITokenPayload {
  subject: string
  exp: string
  algorithm: string
  scope: string[]
}

export const getTokenPayload = (token: string) => {
  if (!token) {
    return null
  }
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    Sentry.captureException(err)
    return null
  }

  return decoded
}
