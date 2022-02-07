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
import { IAuthHeader } from '@gateway/common-types'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { IUserModelData } from '@gateway/features/user/type-resolvers'
import { logger } from '@gateway/logger'
import { callingCountries } from 'country-data'
import * as decode from 'jwt-decode'
import fetch from 'node-fetch'
export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

export const convertToLocal = (
  mobileWithCountryCode: string,
  countryCode: string
) => {
  // tslint:disable-next-line
  countryCode = countryCode.toUpperCase()
  return mobileWithCountryCode.replace(
    callingCountries[countryCode].countryCallingCodes[0],
    '0'
  )
}

export async function getUser(
  body: { [key: string]: string | undefined },
  authHeader: IAuthHeader
) {
  const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
  return await res.json()
}

export async function getUserMobile(userId: string, authHeader: IAuthHeader) {
  try {
    const res = await fetch(`${USER_MANAGEMENT_URL}getUserMobile`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const body = await res.json()

    return body
  } catch (err) {
    logger.error(`Unable to retrieve mobile for error : ${err}`)
  }
}

export function hasScope(authHeader: IAuthHeader, scope: string) {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return (tokenPayload.scope && tokenPayload.scope.indexOf(scope) > -1) || false
}

export function inScope(authHeader: IAuthHeader, scopes: string[]) {
  const matchedScope = scopes.find(scope => hasScope(authHeader, scope))
  return !!matchedScope
}

export function isTokenOwner(authHeader: IAuthHeader, userId: string) {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return (tokenPayload.sub && tokenPayload.sub === userId) || false
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

export function getFullName(user: IUserModelData, language: string) {
  const localName = user.name.find(name => name.use === language)
  return `${localName?.given.join(' ') || ''} ${localName?.family || ''}`.trim()
}
