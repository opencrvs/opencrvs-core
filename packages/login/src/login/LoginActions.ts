import { IStepOne } from './type/StepOne'

export const START_STEP_ONE = 'STEP_ONE/START_STEP_ONE'

export type Action = { type: typeof START_STEP_ONE; payload: IStepOne }

const startStepOne = (values: IStepOne): Action => ({
  type: START_STEP_ONE,
  payload: values
})

export const actions = {
  startStepOne
}
