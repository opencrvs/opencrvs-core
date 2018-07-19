import { loop, LoopReducer, Cmd, Loop } from 'redux-loop'
import { push } from 'react-router-redux'
import * as actions from './loginActions'
import { authApi } from '../utils/authApi'
import * as routes from '../navigation/routes'
import { config } from '../config'

export type LoginState = {
  stepSubmitting: boolean
  stepTwoDetails: { nonce: string }
  submissionError: boolean
  resentSMS: boolean
}

export const initialState: LoginState = {
  stepSubmitting: false,
  stepTwoDetails: {
    nonce: ''
  },
  submissionError: false,
  resentSMS: false
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
          stepSubmitting: true,
          submissionError: false,
          resentSMS: false,
          stepOneDetails: action.payload
        },
        Cmd.run(authApi.submitStepOne, {
          successActionCreator: actions.submitStepOneSuccess,
          failActionCreator: actions.submitStepOneFailed,
          args: [action.payload]
        })
      )
    case actions.STEP_ONE_FAILED:
      return { ...state, stepSubmitting: false, submissionError: true }
    case actions.STEP_ONE_SUCCESS:
      return loop(
        {
          ...state,
          stepSubmitting: false,
          submissionError: false,
          resentSMS: false,
          stepTwoDetails: {
            ...state.stepTwoDetails,
            nonce: action.payload.nonce
          }
        },
        Cmd.action(push(routes.STEP_TWO))
      )
    case actions.RESEND_SMS:
      return loop(
        {
          ...state,
          submissionError: false,
          resentSMS: false
        },
        Cmd.run(authApi.resendSMS, {
          successActionCreator: actions.resendSMSSuccess,
          failActionCreator: actions.resendSMSFailed,
          args: [state.stepTwoDetails.nonce]
        })
      )
    case actions.RESEND_SMS_FAILED:
      return { ...state, resentSMS: false, submissionError: true }
    case actions.RESEND_SMS_SUCCESS:
      return {
        ...state,
        resentSMS: true,
        submissionError: false,
        stepTwoDetails: {
          ...state.stepTwoDetails,
          nonce: action.payload.nonce
        }
      }
    case actions.START_STEP_TWO:
      const code = action.payload.code
      return loop(
        {
          ...state,
          stepSubmitting: true,
          submissionError: false,
          resentSMS: false,
          stepOneDetails: action.payload
        },
        Cmd.run(authApi.submitStepTwo, {
          successActionCreator: actions.submitStepTwoSuccess,
          failActionCreator: actions.submitStepTwoFailed,
          args: [{ code, nonce: state.stepTwoDetails.nonce }]
        })
      )
    case actions.STEP_TWO_FAILED:
      return { ...state, stepSubmitting: false, submissionError: true }
    case actions.STEP_TWO_SUCCESS:
      window.location.href = config.REGISTER_APP_URL
      return {
        ...state,
        stepSubmitting: false,
        submissionError: false,
        resentSMS: false
      }

    default:
      return state
  }
}
