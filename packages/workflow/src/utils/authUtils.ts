import * as decode from 'jwt-decode'
import * as Hapi from 'hapi'

export enum USER_SCOPE {
  DECLARE = 'declare',
  VALIDATE = 'validate',
  REGISTER = 'register',
  CERTIFY = 'certify',
  VALIDATE = 'validate'
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
      `getTokenPayload: Error occured during token decode : ${err}`
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

export function hasRegisterScope(request: Hapi.Request): boolean {
  return hasScope(request, USER_SCOPE.REGISTER)
}

export function hasValidateScope(request: Hapi.Request): boolean {
  return hasScope(request, USER_SCOPE.VALIDATE)
}

export function hasValidateScope(request: Hapi.Request): boolean {
  return hasScope(request, USER_SCOPE.VALIDATE)
}
