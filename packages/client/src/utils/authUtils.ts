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
import { ACCESS_TOKEN_REFRESH_BUFFER_MS } from './constants'
import { authApi } from '@client/utils/authApi'
import { ITokenPayload } from '@opencrvs/commons/client'

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

export async function removeToken() {
  const token = getToken()
  const refresh = getRefreshToken()
  if (token) {
    try {
      await authApi.invalidateToken(token)
    } catch (err) {
      Sentry.captureException(err)
    }
  }
  if (refresh) {
    try {
      await authApi.invalidateToken(refresh)
    } catch (err) {
      Sentry.captureException(err)
    }
  }
  localStorage.removeItem('opencrvs')
  removeRefreshToken()
}

export function getRefreshToken(): string {
  const params = new URLSearchParams(window.location.search)
  return (
    params.get('refreshToken') || localStorage.getItem('opencrvs-refresh') || ''
  )
}

export function storeRefreshToken(token: string) {
  localStorage.setItem('opencrvs-refresh', token)
}

export function removeRefreshToken() {
  localStorage.removeItem('opencrvs-refresh')
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

function isAccessTokenFresh(token: string): boolean {
  const payload = getTokenPayload(token)
  if (!payload) {
    return false
  }
  const expMillis = Number(payload.exp) * 1000
  return expMillis - Date.now() > ACCESS_TOKEN_REFRESH_BUFFER_MS
}

function forceReauthentication(): never {
  localStorage.removeItem('opencrvs')
  removeRefreshToken()
  window.location.assign('/login')
  throw new Error('Authentication required')
}

async function performRefresh(): Promise<void> {
  const refresh = getRefreshToken()
  if (!refresh) {
    forceReauthentication()
  }

  const res = await fetch('/api/auth/refreshToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: refresh })
  })

  if (!res.ok) {
    forceReauthentication()
  }

  const data = await res.json()
  storeToken(data.token)
  if (data.refreshToken) {
    storeRefreshToken(data.refreshToken)
  }
}

let inFlightRefresh: Promise<void> | null = null

export async function ensureFreshAccessToken(): Promise<void> {
  const token = getToken()
  if (token && isAccessTokenFresh(token)) {
    return
  }

  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null
    })
  }

  return inFlightRefresh
}
