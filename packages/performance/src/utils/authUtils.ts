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
import * as queryString from 'querystring'
import decode from 'jwt-decode'
import * as Sentry from '@sentry/browser'

export interface IURLParams {
  [key: string]: string | string[] | undefined
}
export type Scope = string[]
export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: Scope
}

export const isTokenStillValid = (decoded: ITokenPayload) => {
  return Number(decoded.exp) * 1000 > Date.now()
}

export function getToken(): string {
  return (
    (queryString.parse(window.location.search.replace(/^\?/, ''))
      .token as string) ||
    localStorage.getItem('opencrvs') ||
    ''
  )
}

export function storeToken(token: string) {
  localStorage.setItem('opencrvs', token)
}

export function removeToken() {
  localStorage.removeItem('opencrvs')
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
