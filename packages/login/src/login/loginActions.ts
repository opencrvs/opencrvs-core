import { IStepOneData } from '../type/login'
import { AxiosError } from 'axios'

export const START_STEP_ONE = 'STEP_ONE/START_STEP_ONE'
export const STEP_ONE_SUCCESS = 'STEP_ONE/STEP_ONE_SUCCESS'
export const STEP_ONE_FAILED = 'STEP_ONE/STEP_ONE_FAILED'

export type Action =
  | { type: typeof START_STEP_ONE; payload: IStepOneData }
  | { type: typeof STEP_ONE_SUCCESS; payload: any }
  | { type: typeof STEP_ONE_FAILED; payload: Error }

export const startStepOne = (values: IStepOneData): Action => ({
  type: START_STEP_ONE,
  payload: values
})

export const submitStepOneSuccess = (response: any): Action => ({
  type: STEP_ONE_SUCCESS,
  payload: response
})

export const submitStepOneFailed = (error: AxiosError): Action => ({
  type: STEP_ONE_FAILED,
  payload: error
})
