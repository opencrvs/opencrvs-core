import * as queryString from 'query-string'
import * as decode from 'jwt-decode'

export interface IURLParams {
  [key: string]: string | string[] | undefined
}
export type Scope = string[]
export interface ITokenPayload {
  subject: string
  exp: string
  algorithm: string
  scope: Scope
}

export const isTokenStillValid = (decoded: ITokenPayload) => {
  return Number(decoded.exp) * 1000 > Date.now()
}

export function getToken() {
  return (
    queryString.parse(window.location.search).token ||
    localStorage.getItem('opencrvs')
  )
}

export function storeToken(token: string) {
  localStorage.setItem('opencrvs', token)
}

export const getTokenPayload = (token: string) => {
  if (!token) {
    return null
  }
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    return null
  }

  return decoded
}
