import decode from 'jwt-decode'
import * as Sentry from '@sentry/browser'

export const ERROR_CODE_TOO_MANY_ATTEMPTS = 429
export const ERROR_CODE_FIELD_MISSING = 500
export const ERROR_CODE_INVALID_CREDENTIALS = 401
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
