import { IStepOne } from './type/Login'
import { AxiosError } from 'axios'
import { authApi } from '../utils/authApi'

export const START_STEP_ONE = 'STEP_ONE/START_STEP_ONE'
export const STEP_ONE_SUCCESS = 'STEP_ONE/STEP_ONE_SUCCESS'
export const STEP_ONE_FAILED = 'STEP_ONE/STEP_ONE_FAILED'

export type Action =
  | { type: typeof START_STEP_ONE; payload: IStepOne }
  | { type: typeof STEP_ONE_SUCCESS; payload: any }
  | { type: typeof STEP_ONE_FAILED; payload: Error }

export const startStepOne = (values: IStepOne): Action => ({
  type: START_STEP_ONE,
  payload: values
})

export const submitStepOne = (data: IStepOne): Promise<Action> => {
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
