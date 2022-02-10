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
import { AxiosError } from 'axios'
import { RouterAction, push, goBack as back } from 'connected-react-router'
import {
  IApplicationConfig,
  IAuthenticateResponse,
  IAuthenticationData,
  ITokenResponse
} from '@login/utils/authApi'
import {
  PHONE_NUMBER_VERIFICATION,
  FORGOTTEN_ITEM,
  RECOVERY_CODE_ENTRY,
  SECURITY_QUESTION,
  UPDATE_PASSWORD,
  STEP_ONE,
  SUCCESS
} from '@login/navigation/routes'

export const CONFIG_LOAD = 'login/CONFIG_LOAD'
export const CONFIG_LOADED = 'login/CONFIG_LOADED'
export const CONFIG_LOAD_ERROR = 'login/CONFIG_LOAD_ERROR'

export const AUTHENTICATE = 'login/AUTHENTICATE'
export const AUTHENTICATION_COMPLETED = 'login/AUTHENTICATION_COMPLETED'
export const AUTHENTICATION_FAILED = 'login/AUTHENTICATION_FAILED'

export const VERIFY_CODE = 'login/VERIFY_CODE'
export const VERIFY_CODE_COMPLETED = 'login/VERIFY_CODE_COMPLETED'
export const VERIFY_CODE_FAILED = 'login/VERIFY_CODE_FAILED'

export const RESEND_SMS = 'login/RESEND_SMS'
export const RESEND_SMS_COMPLETED = 'login/RESEND_SMS_COMPLETED'
export const RESEND_SMS_FAILED = 'login/RESEND_SMS_FAILED'
export const AUTHENTICATE_VALIDATE = 'login/AUTHENTICATE_VALIDATE'
export const GOTO_APP = 'login/GOTO_APP'

export enum FORGOTTEN_ITEMS {
  USERNAME = 'username',
  PASSWORD = 'password'
}

export type ApplicationConfigAction = {
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
  payload: IAuthenticationData
}
export type AuthenticationFieldValidationAction = {
  type: typeof AUTHENTICATE_VALIDATE
  payload: number
}

export type AuthenticateResponseAction = {
  type: typeof AUTHENTICATION_COMPLETED
  payload: IAuthenticateResponse
}

export type AuthenticationFailedAction = {
  type: typeof AUTHENTICATION_FAILED
  payload: AxiosError
}

export type ResendSMSAction = {
  type: typeof RESEND_SMS
}

export type ResendSMSCompleteAction = {
  type: typeof RESEND_SMS_COMPLETED
  payload: IAuthenticateResponse
}

export type ResendSMSFailedAction = {
  type: typeof RESEND_SMS_FAILED
  payload: Error
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

export type GoToAppAction = {
  type: typeof GOTO_APP
  payload: string
}

export type Action =
  | RouterAction
  | ApplicationConfigAction
  | ApplicationConfigLoaded
  | ApplicationConfigFailed
  | AuthenticationDataAction
  | AuthenticateResponseAction
  | AuthenticationFailedAction
  | ResendSMSAction
  | ResendSMSCompleteAction
  | ResendSMSFailedAction
  | VerifyCodeAction
  | VerifyCodeCompleteAction
  | VerifyCodeFailedAction
  | GoToAppAction
  | AuthenticationFieldValidationAction

export const applicationConfigLoadAction = (): ApplicationConfigAction => ({
  type: CONFIG_LOAD
})

export const applicationConfigLoadedAction = (
  response: IApplicationConfig
): ApplicationConfigLoaded => ({
  type: CONFIG_LOADED,
  payload: response
})

export const applicationConfigFailedAction = (
  error: Error
): ApplicationConfigFailed => ({
  type: CONFIG_LOAD_ERROR,
  payload: error
})

export const authenticate = (
  values: IAuthenticationData
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
    payload: cleanedData
  }
}

export const completeAuthentication = (
  response: IAuthenticateResponse
): AuthenticateResponseAction => ({
  type: AUTHENTICATION_COMPLETED,
  payload: response
})

export const failAuthentication = (
  error: AxiosError
): AuthenticationFailedAction => ({
  type: AUTHENTICATION_FAILED,
  payload: error
})

export const resendSMS = (): ResendSMSAction => ({
  type: RESEND_SMS
})

export interface IVerifyCodeNumbers {
  code: string
}

export const completeSMSResend = (
  response: IAuthenticateResponse
): ResendSMSCompleteAction => ({
  type: RESEND_SMS_COMPLETED,
  payload: response
})

export const failSMSResend = (error: AxiosError): ResendSMSFailedAction => ({
  type: RESEND_SMS_FAILED,
  payload: error
})

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
export function goBack() {
  return back()
}
export const gotoApp = (appId: string): GoToAppAction => ({
  type: GOTO_APP,
  payload: appId
})
export function goToForgottenItemForm() {
  return push(FORGOTTEN_ITEM)
}
export function goToPhoneNumberVerificationForm(forgottenItem: string) {
  return push(PHONE_NUMBER_VERIFICATION, { forgottenItem })
}
export function goToRecoveryCodeEntryForm(
  nonce: string,
  mobile: string,
  forgottenItem: string
) {
  return push(RECOVERY_CODE_ENTRY, {
    nonce,
    mobile,
    forgottenItem
  })
}
export function goToSecurityQuestionForm(
  nonce: string,
  securityQuestionKey: string,
  forgottenItem: string
) {
  return push(SECURITY_QUESTION, {
    nonce,
    securityQuestionKey,
    forgottenItem
  })
}
export function goToUpdatePasswordForm(nonce: string) {
  return push(UPDATE_PASSWORD, { nonce })
}
export function goToSuccessPage(forgottenItem: string) {
  return push(SUCCESS, { forgottenItem })
}
export function goToHome() {
  return push(STEP_ONE)
}
