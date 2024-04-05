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
import * as decode from 'jwt-decode'
import * as Hapi from '@hapi/hapi'
import { hasScope } from '@opencrvs/commons/authentication'

export enum USER_SCOPE {
  DECLARE = 'declare',
  VALIDATE = 'validate',
  REGISTER = 'register',
  CERTIFY = 'certify',
  RECORD_SEARCH = 'recordsearch',
  VERIFY = 'verify'
}

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

export const getTokenPayload = (token: string) => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}

export const getToken = (request: Hapi.Request): string => {
  if (request.headers.authorization.indexOf('Bearer') > -1) {
    return request.headers.authorization.split(' ')[1]
  } else {
    return request.headers.authorization
  }
}

export function hasRegisterScope(request: Hapi.Request): boolean {
  return hasScope(
    { Authorization: request.headers.authorization },
    USER_SCOPE.REGISTER
  )
}

export function hasValidateScope(request: Hapi.Request): boolean {
  return hasScope(
    { Authorization: request.headers.authorization },
    USER_SCOPE.VALIDATE
  )
}

export function hasDeclareScope(request: Hapi.Request): boolean {
  return hasScope(
    { Authorization: request.headers.authorization },
    USER_SCOPE.DECLARE
  )
}
