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
