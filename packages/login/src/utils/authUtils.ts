import * as decode from 'jwt-decode'
import { config } from '../config'

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
    return null
  }

  return decoded
}

export const getRedirectURL = (token: string): string => {
  const decoded: ITokenPayload = getTokenPayload(token) as ITokenPayload

  const isPerformanceUser = decoded.scope.indexOf('performance') > -1
  if (isPerformanceUser) {
    return `${config.PERFORMANCE_APP_URL}?token=${token}`
  } else {
    return `${config.REGISTER_APP_URL}?token=${token}`
  }
}
