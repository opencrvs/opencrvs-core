import { IStepOneData } from '../type/login'
import { AxiosError } from 'axios'
import { authApi } from '../utils/authApi'
import { convertToMSISDN } from '../utils/dataCleanse'
import { config } from '../config'

export const START_STEP_ONE = 'STEP_ONE/START_STEP_ONE'
export const STEP_ONE_SUCCESS = 'STEP_ONE/STEP_ONE_SUCCESS'
export const STEP_ONE_FAILED = 'STEP_ONE/STEP_ONE_FAILED'
export const STEP_ONE_COMPLETE = 'STEP_ONE/STEP_ONE_COMPLETE'

export type Action =
  | { type: typeof START_STEP_ONE; payload: IStepOneData }
  | { type: typeof STEP_ONE_SUCCESS; payload: any }
  | { type: typeof STEP_ONE_FAILED; payload: Error }
  | { type: typeof STEP_ONE_COMPLETE }

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

export const submitStepOne = (data: IStepOneData): Promise<Action> => {
  return authApi.submitStepOne(data)
}

export const submitStepOneSuccess = (response: any): Action => ({
  type: STEP_ONE_SUCCESS,
  payload: response
})

export const submitStepOneFailed = (error: AxiosError): Action => ({
  type: STEP_ONE_FAILED,
  payload: error
})

export const stepTwoComplete = (): Action => ({
  type: STEP_ONE_COMPLETE
})
