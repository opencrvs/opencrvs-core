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
import { TOKEN_EXPIRE_MILLIS } from './constants'
import { authApi } from '@client/utils/authApi'
import { Scope } from '@opencrvs/commons/client'

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: Scope[]
}

export const isTokenStillValid = (decoded: ITokenPayload) => {
  return Number(decoded.exp) * 1000 > Date.now()
}

export function getToken(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') || localStorage.getItem('opencrvs') || ''
}

export function storeToken(token: string) {
  localStorage.setItem('opencrvs', token)
}

export function removeToken() {
  const token = getToken()
  if (token) {
    try {
      authApi.invalidateToken(token)
    } catch (err) {
      Sentry.captureException(err)
    }
  }
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

function isTokenAboutToExpire(token: string) {
  const payload = token && getTokenPayload(token)
  const payloadExpMillis = Number(payload && payload.exp) * 1000
  return payloadExpMillis - Date.now() <= TOKEN_EXPIRE_MILLIS
}

export async function refreshToken() {
  const token = getToken()
  if (isTokenAboutToExpire(token)) {
    const res = await fetch(`${window.config.AUTH_URL}/refreshToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token
      })
    })

    if (!res.ok) {
      return false
    } else {
      const data = await res.json()
      removeToken()
      storeToken(data.token)
    }
  }
  return true
}
