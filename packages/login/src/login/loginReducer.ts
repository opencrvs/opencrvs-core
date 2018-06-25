import { loop, LoopReducer, Cmd, Loop } from 'redux-loop'
import * as actions from './loginActions'

export type LoginState = {
  stepOneSubmitting: boolean
  mobile: string | null
  password: string | null
}

export const initialState: LoginState = {
  stepOneSubmitting: false,
  mobile: null,
  password: null
}

export const loginReducer: LoopReducer<LoginState, actions.Action> = (
  state: LoginState = initialState,
  action: actions.Action
): LoginState | Loop<LoginState, actions.Action> => {
  switch (action.type) {
    case actions.START_STEP_ONE:
      return loop(
        { ...state, stepOneSubmitting: true },
        Cmd.run(actions.submitStepOne, {
          successActionCreator: actions.submitStepOneSuccess,
          failActionCreator: actions.submitStepOneFailed,
          args: [action.payload]
        })
      )
    default:
      return state
  }
}
