import { AxiosError } from 'axios'
import { RouterAction } from 'react-router-redux'
import { convertToMSISDN } from '../utils/dataCleanse'
import { config } from '../config'
import { IAuthenticateResponse } from '../utils/authApi'
import { IStepOneData } from './StepOneForm'
import { IStepTwoSMSData } from './StepTwoForm'

export const START_STEP_ONE = 'STEP_ONE/START_STEP_ONE'
export const STEP_ONE_SUCCESS = 'STEP_ONE/STEP_ONE_SUCCESS'
export const STEP_ONE_FAILED = 'STEP_ONE/STEP_ONE_FAILED'
export const STEP_ONE_COMPLETE = 'STEP_ONE/STEP_ONE_COMPLETE'

export const START_STEP_TWO = 'STEP_TWO/START_STEP_TWO'
export const STEP_TWO_SUCCESS = 'STEP_TWO/STEP_TWO_SUCCESS'
export const STEP_TWO_FAILED = 'STEP_TWO/STEP_TWO_FAILED'
export const STEP_TWO_COMPLETE = 'STEP_TWO/STEP_TWO_COMPLETE'

export const RESEND_SMS = 'STEP_TWO/RESEND_SMS'
export const RESEND_SMS_SUCCESS = 'STEP_TWO/RESEND_SMS_SUCCESS'
export const RESEND_SMS_FAILED = 'STEP_TWO/RESEND_SMS_FAILED'

export type Action =
  | { type: typeof START_STEP_ONE; payload: IStepOneData }
  | { type: typeof STEP_ONE_SUCCESS; payload: IAuthenticateResponse }
  | { type: typeof STEP_ONE_FAILED; payload: Error }
  | { type: typeof STEP_ONE_COMPLETE }
  | { type: typeof START_STEP_TWO; payload: { code: string } }
  | { type: typeof STEP_TWO_SUCCESS }
  | { type: typeof STEP_TWO_FAILED; payload: Error }
  | { type: typeof STEP_TWO_COMPLETE }
  | { type: typeof RESEND_SMS }
  | { type: typeof RESEND_SMS_SUCCESS; payload: IAuthenticateResponse }
  | { type: typeof RESEND_SMS_FAILED; payload: Error }
  | RouterAction

export const startStepOne = (values: IStepOneData): Action => {
  const cleanedData = {
    mobile: convertToMSISDN(values.mobile, config.LOCALE),
    password: values.password
  }

  return {
    type: START_STEP_ONE,
    payload: cleanedData
  }
}

export const submitStepOneSuccess = (
  response: IAuthenticateResponse
): Action => ({
  type: STEP_ONE_SUCCESS,
  payload: response
})

export const submitStepOneFailed = (error: AxiosError): Action => ({
  type: STEP_ONE_FAILED,
  payload: error
})

export const resendSMS = (): Action => ({
  type: RESEND_SMS
})

export const startStepTwo = (values: IStepTwoSMSData): Action => {
  const code = Object.values(values).join('')

  return {
    type: START_STEP_TWO,
    payload: { code }
  }
}

export const resendSMSSuccess = (response: IAuthenticateResponse): Action => ({
  type: RESEND_SMS_SUCCESS,
  payload: response
})

export const resendSMSFailed = (error: AxiosError): Action => ({
  type: RESEND_SMS_FAILED,
  payload: error
})
