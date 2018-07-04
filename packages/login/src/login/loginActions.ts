import { AxiosError } from 'axios'
import { RouterAction } from 'react-router-redux'
import { IStepOneData, IStepTwoData, IStepTwoSMSData } from '../type/login'
import { convertToMSISDN } from '../utils/dataCleanse'
import { config } from '../config'

export const START_STEP_ONE = 'STEP_ONE/START_STEP_ONE'
export const STEP_ONE_SUCCESS = 'STEP_ONE/STEP_ONE_SUCCESS'
export const STEP_ONE_FAILED = 'STEP_ONE/STEP_ONE_FAILED'
export const STEP_ONE_COMPLETE = 'STEP_ONE/STEP_ONE_COMPLETE'

export const START_STEP_TWO = 'STEP_TWO/START_STEP_TWO'
export const STEP_TWO_SUCCESS = 'STEP_TWO/STEP_TWO_SUCCESS'
export const STEP_TWO_FAILED = 'STEP_TWO/STEP_TWO_FAILED'
export const STEP_TWO_COMPLETE = 'STEP_TWO/STEP_TWO_COMPLETE'

export type Action =
  | { type: typeof START_STEP_ONE; payload: IStepOneData }
  | { type: typeof STEP_ONE_SUCCESS; payload: any }
  | { type: typeof STEP_ONE_FAILED; payload: Error }
  | { type: typeof STEP_ONE_COMPLETE }
  | { type: typeof START_STEP_TWO; payload: IStepTwoData }
  | { type: typeof STEP_TWO_SUCCESS; payload: any }
  | { type: typeof STEP_TWO_FAILED; payload: Error }
  | { type: typeof STEP_TWO_COMPLETE }
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

export const submitStepOneSuccess = (response: any): Action => ({
  type: STEP_ONE_SUCCESS,
  payload: response
})

export const submitStepOneFailed = (error: AxiosError): Action => ({
  type: STEP_ONE_FAILED,
  payload: error
})

export const startStepTwo = (values: IStepTwoSMSData): Action => {
  const code = Object.values(values).join('')
  const payload: IStepTwoData = {
    nonce: '',
    code
  }

  return {
    type: START_STEP_TWO,
    payload
  }
}
