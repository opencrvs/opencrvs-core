import { AxiosError } from 'axios'
import { RouterAction } from 'react-router-redux'
import { convertToMSISDN } from '../utils/dataCleanse'
import { config } from '../config'
import { IAuthenticateResponse, IAuthenticationData } from '../utils/authApi'

export const AUTHENTICATE = 'login/AUTHENTICATE'
export const AUTHENTICATION_COMPLETED = 'login/AUTHENTICATION_COMPLETED'
export const AUTHENTICATION_FAILED = 'login/AUTHENTICATION_FAILED'

export const VERIFY_CODE = 'login/VERIFY_CODE'
export const VERIFY_CODE_COMPLETED = 'login/VERIFY_CODE_COMPLETED'
export const VERIFY_CODE_FAILED = 'login/VERIFY_CODE_FAILED'

export const RESEND_SMS = 'login/RESEND_SMS'
export const RESEND_SMS_COMPLETED = 'login/RESEND_SMS_COMPLETED'
export const RESEND_SMS_FAILED = 'login/RESEND_SMS_FAILED'

export type Action =
  | { type: typeof AUTHENTICATE; payload: IAuthenticationData }
  | { type: typeof AUTHENTICATION_COMPLETED; payload: IAuthenticateResponse }
  | { type: typeof AUTHENTICATION_FAILED; payload: Error }
  | { type: typeof VERIFY_CODE; payload: { code: string } }
  | { type: typeof VERIFY_CODE_COMPLETED; payload: IAuthenticateResponse }
  | { type: typeof VERIFY_CODE_FAILED; payload: Error }
  | { type: typeof RESEND_SMS }
  | { type: typeof RESEND_SMS_COMPLETED; payload: IAuthenticateResponse }
  | { type: typeof RESEND_SMS_FAILED; payload: Error }
  | RouterAction

export const authenticate = (values: IAuthenticationData): Action => {
  const cleanedData = {
    mobile: convertToMSISDN(values.mobile, config.LOCALE),
    password: values.password
  }

  return {
    type: AUTHENTICATE,
    payload: cleanedData
  }
}

export const completeAuthentication = (
  response: IAuthenticateResponse
): Action => ({
  type: AUTHENTICATION_COMPLETED,
  payload: response
})

export const failAuthentication = (error: AxiosError): Action => ({
  type: AUTHENTICATION_FAILED,
  payload: error
})

export const resendSMS = (): Action => ({
  type: RESEND_SMS
})

export interface IVerifyCodeNumbers {
  code1: string
  code2: string
  code3: string
  code4: string
  code5: string
  code6: string
}

export const completeSMSResend = (response: IAuthenticateResponse): Action => ({
  type: RESEND_SMS_COMPLETED,
  payload: response
})

export const failSMSResend = (error: AxiosError): Action => ({
  type: RESEND_SMS_FAILED,
  payload: error
})

export const verifyCode = (values: IVerifyCodeNumbers): Action => {
  const code = Object.values(values).join('')

  return {
    type: VERIFY_CODE,
    payload: { code }
  }
}

export const completeVerifyCode = (
  response: IAuthenticateResponse
): Action => ({
  type: VERIFY_CODE_COMPLETED,
  payload: response
})

export const failVerifyCode = (error: AxiosError): Action => ({
  type: VERIFY_CODE_FAILED,
  payload: error
})
