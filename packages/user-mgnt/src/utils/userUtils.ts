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
import * as Hapi from '@hapi/hapi'
import { ITokenPayload } from '@user-mgnt/utils/token'
import * as decode from 'jwt-decode'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export interface IAuthHeader {
  Authorization: string
}

export const hasScope = (request: Hapi.Request, scope: string): boolean => {
  if (
    !request.auth ||
    !request.auth.credentials ||
    !request.auth.credentials.scope
  ) {
    return false
  }
  return request.auth.credentials.scope.includes(scope)
}

export function hasDemoScope(request: Hapi.Request): boolean {
  return hasScope(request, 'demo')
}

export const getTokenPayload = (token: string): ITokenPayload => {
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

export const getUserId = (authHeader: IAuthHeader): string => {
  if (!authHeader || !authHeader.Authorization) {
    throw new Error(`getUserId: Error occurred during token decode`)
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return tokenPayload.sub
}
