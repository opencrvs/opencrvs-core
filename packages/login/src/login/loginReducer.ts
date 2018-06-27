import { loop, LoopReducer, Cmd, Loop } from 'redux-loop'
import { IStepOneData, IStepTwoData } from '../type/login'
import * as actions from './loginActions'
import * as routes from '../navigation/routes'
import { store } from '../store'
import { push } from 'connected-react-router'

export type LoginState = {
  stepOneSubmitting: boolean
  stepOneDetails: IStepOneData
  stepTwoDetails: IStepTwoData
  submissionError: boolean
}

export const initialState: LoginState = {
  stepOneSubmitting: false,
  stepOneDetails: {
    mobile: '',
    password: ''
  },
  stepTwoDetails: {
    nonce: '',
    code: ''
  },
  submissionError: false
}

export const loginReducer: LoopReducer<LoginState, actions.Action> = (
  state: LoginState = initialState,
  action: actions.Action
): LoginState | Loop<LoginState, actions.Action> => {
  switch (action.type) {
    case actions.START_STEP_ONE:
      return loop(
        {
          ...state,
          stepOneSubmitting: true,
          submissionError: false,
          stepOneDetails: action.payload
        },
        Cmd.run(actions.submitStepOne, {
          successActionCreator: actions.submitStepOneSuccess,
          failActionCreator: actions.submitStepOneFailed,
          args: [action.payload]
        })
      )
    case actions.STEP_ONE_FAILED:
      return { ...state, stepOneSubmitting: false, submissionError: true }
    case actions.STEP_ONE_SUCCESS:
      return loop(
        {
          ...state,
          stepOneSubmitting: false,
          submissionError: false,
          stepTwoDetails: {
            ...state.stepTwoDetails,
            nonce: action.payload.nonce
          },
          stepOneDetails: {
            ...state.stepOneDetails,
            mobile: action.payload.mobile
          }
        },
        Cmd.run(gotoStepTwo, {
          successActionCreator: actions.stepTwoComplete,
          args: [Cmd.dispatch]
        })
      )

    default:
      return state
  }
}

export function gotoStepTwo(dispatch: any) {
  store.dispatch(push(routes.STEP_TWO))
  return routes.STEP_TWO
}
