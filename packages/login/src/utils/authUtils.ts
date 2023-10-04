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
import decode from 'jwt-decode'
import * as Sentry from '@sentry/react'

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

export function maskEmail(email: string) {
  const parts = email.split('@')
  const username = parts[0]
  const domain = parts[1]

  const maskedUsername = maskString(username)
  const maskedDomain =
    maskString(domain.split('.')[0]) + '.' + maskString(domain.split('.')[1])

  return maskedUsername + '@' + maskedDomain
}

export function maskString(s: string) {
  const maskPercentage = 0.6
  const emailLength = s.length || 0
  const unmaskedEmailLength =
    emailLength - Math.ceil(maskPercentage * emailLength)
  const startFrom = Math.ceil(unmaskedEmailLength / 2)
  const endBefore = unmaskedEmailLength - startFrom
  const maskedEmail = s.replace(
    s.slice(startFrom, emailLength - endBefore),
    '*'.repeat(emailLength - startFrom - endBefore)
  )
  return maskedEmail
}
