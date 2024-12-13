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
import { AxiosError } from 'axios'
import {
  IApplicationConfigResponse,
  IApplicationConfig,
  IAuthenticateResponse,
  IAuthenticationData,
  ITokenResponse,
  NotificationEvent
} from '@login/utils/authApi'

export const CONFIG_LOAD = 'login/CONFIG_LOAD'
export const CONFIG_LOADED = 'login/CONFIG_LOADED'
export const CONFIG_LOAD_ERROR = 'login/CONFIG_LOAD_ERROR'

export const AUTHENTICATE = 'login/AUTHENTICATE'
export const AUTHENTICATION_COMPLETED = 'login/AUTHENTICATION_COMPLETED'
export const AUTHENTICATION_FAILED = 'login/AUTHENTICATION_FAILED'

export const VERIFY_CODE = 'login/VERIFY_CODE'
export const VERIFY_CODE_COMPLETED = 'login/VERIFY_CODE_COMPLETED'
export const VERIFY_CODE_FAILED = 'login/VERIFY_CODE_FAILED'

export const RESEND_AUTHENTICATION_CODE = 'login/RESEND_AUTHENTICATION_CODE'
export const RESEND_AUTHENTICATION_CODE_COMPLETED =
  'login/RESEND_AUTHENTICATION_CODE_COMPLETED'
export const RESEND_AUTHENTICATION_CODE_FAILED =
  'login/RESEND_AUTHENTICATION_CODE_FAILED'
export const AUTHENTICATE_VALIDATE = 'login/AUTHENTICATE_VALIDATE'
export const AUTHENTICATE_RESET = 'login/AUTHENTICATE_RESET'
export const GOTO_APP = 'login/GOTO_APP'

export const CLIENT_REDIRECT_ROUTE = 'login/CLIENT_REDIRECT_ROUTE'

export const RELOAD_MODAL_VISIBILITY = 'login/RELOAD_MODAL_VISIBILITY'

export enum FORGOTTEN_ITEMS {
  USERNAME = 'username',
  PASSWORD = 'password'
}

type ApplicationConfigAction = {
  type: typeof CONFIG_LOAD
}

export type ApplicationConfigLoaded = {
  type: typeof CONFIG_LOADED
  payload: IApplicationConfig
}

export type ApplicationConfigFailed = {
  type: typeof CONFIG_LOAD_ERROR
  payload: Error
}

export type AuthenticationDataAction = {
  type: typeof AUTHENTICATE
  payload: IAuthenticationData & { inAppRedirect: () => void }
}
export type AuthenticationFieldValidationAction = {
  type: typeof AUTHENTICATE_VALIDATE
  payload: number
}

export type AuthenticationResetAction = {
  type: typeof AUTHENTICATE_RESET
}

export type AuthenticateResponseAction = {
  type: typeof AUTHENTICATION_COMPLETED
  payload: IAuthenticateResponse & { inAppRedirect: () => void }
}

export type AuthenticationFailedAction = {
  type: typeof AUTHENTICATION_FAILED
  payload: AxiosError
}

export type ResendAuthenticationCodeAction = {
  type: typeof RESEND_AUTHENTICATION_CODE
  payload: NotificationEvent
}

export type ResendAuthenticationCodeCompleteAction = {
  type: typeof RESEND_AUTHENTICATION_CODE_COMPLETED
  payload: IAuthenticateResponse
}

export type ResendAuthenticationCodeFailedAction = {
  type: typeof RESEND_AUTHENTICATION_CODE_FAILED
  payload: Error
}

export type StoreClientRedirectRouteAction = {
  type: typeof CLIENT_REDIRECT_ROUTE
  payload: { url: string }
}

export type VerifyCodeAction = {
  type: typeof VERIFY_CODE
  payload: { code: string }
}

export type VerifyCodeCompleteAction = {
  type: typeof VERIFY_CODE_COMPLETED
  payload: ITokenResponse
}

export type VerifyCodeFailedAction = {
  type: typeof VERIFY_CODE_FAILED
  payload: Error
}

type GoToAppAction = {
  type: typeof GOTO_APP
  payload: string
}

type StoreReloadModalVisibilityAction = {
  type: typeof RELOAD_MODAL_VISIBILITY
  payload: { visibility: boolean }
}

export type Action =
  | ApplicationConfigAction
  | ApplicationConfigLoaded
  | ApplicationConfigFailed
  | AuthenticationDataAction
  | AuthenticateResponseAction
  | AuthenticationFailedAction
  | ResendAuthenticationCodeAction
  | ResendAuthenticationCodeCompleteAction
  | ResendAuthenticationCodeFailedAction
  | VerifyCodeAction
  | VerifyCodeCompleteAction
  | VerifyCodeFailedAction
  | GoToAppAction
  | AuthenticationFieldValidationAction
  | AuthenticationResetAction
  | StoreClientRedirectRouteAction
  | StoreReloadModalVisibilityAction

export const resetSubmissionError = (): AuthenticationResetAction => {
  return {
    type: AUTHENTICATE_RESET
  }
}
export const applicationConfigLoadedAction = (
  response: IApplicationConfigResponse
): ApplicationConfigLoaded => ({
  type: CONFIG_LOADED,
  payload: response.config
})

export const applicationConfigFailedAction = (
  error: Error
): ApplicationConfigFailed => ({
  type: CONFIG_LOAD_ERROR,
  payload: error
})

export const authenticate = (
  values: IAuthenticationData,
  /**
   * fallback redirection if system does not return token
   */
  inAppRedirect: () => void
): AuthenticationDataAction | AuthenticationFieldValidationAction => {
  if (!values.username || !values.password) {
    return {
      type: AUTHENTICATE_VALIDATE,
      payload: 500
    }
  }
  const cleanedData = {
    username: values.username,
    password: values.password
  }

  return {
    type: AUTHENTICATE,
    payload: { ...cleanedData, inAppRedirect }
  }
}

export const completeAuthentication = (
  response: IAuthenticateResponse,
  inAppRedirect: () => void
): AuthenticateResponseAction => ({
  type: AUTHENTICATION_COMPLETED,
  payload: { ...response, inAppRedirect }
})

export const failAuthentication = (
  error: AxiosError
): AuthenticationFailedAction => ({
  type: AUTHENTICATION_FAILED,
  payload: error
})

export const resendAuthenticationCode = (
  notificationEvent: NotificationEvent
): ResendAuthenticationCodeAction => ({
  type: RESEND_AUTHENTICATION_CODE,
  payload: notificationEvent
})

export interface IVerifyCodeNumbers {
  code: string
}

export const completeAuthenticationCodeResend = (
  response: IAuthenticateResponse
): ResendAuthenticationCodeCompleteAction => ({
  type: RESEND_AUTHENTICATION_CODE_COMPLETED,
  payload: response
})

export const failAuthenticationCodeResend = (
  error: AxiosError
): ResendAuthenticationCodeFailedAction => ({
  type: RESEND_AUTHENTICATION_CODE_FAILED,
  payload: error
})

export const storeClientRedirectRoute = (
  redirectUrlRoute: string
): StoreClientRedirectRouteAction => {
  const url = redirectUrlRoute
  return {
    type: CLIENT_REDIRECT_ROUTE,
    payload: { url }
  }
}

export const verifyCode = (values: IVerifyCodeNumbers): VerifyCodeAction => {
  const code = Object.values(values).join('')
  return {
    type: VERIFY_CODE,
    payload: { code }
  }
}

export const completeVerifyCode = (
  response: ITokenResponse
): VerifyCodeCompleteAction => ({
  type: VERIFY_CODE_COMPLETED,
  payload: response
})

export const failVerifyCode = (error: AxiosError): VerifyCodeFailedAction => ({
  type: VERIFY_CODE_FAILED,
  payload: error
})
