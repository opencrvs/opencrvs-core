import { loop, LoopReducer, Cmd, Loop } from 'redux-loop'
import { push } from 'react-router-redux'
import * as actions from './actions'
import { authApi } from '../utils/authApi'
import * as routes from '../navigation/routes'
import { config } from '../config'

export type LoginState = {
  submitting: boolean
  authenticationDetails: { nonce: string }
  submissionError: boolean
  resentSMS: boolean
}

export const initialState: LoginState = {
  submitting: false,
  authenticationDetails: {
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
    case actions.AUTHENTICATE:
      return loop(
        {
          ...state,
          submitting: true,
          submissionError: false,
          resentSMS: false,
          stepOneDetails: action.payload
        },
        Cmd.run(authApi.authenticate, {
          successActionCreator: actions.completeAuthentication,
          failActionCreator: actions.failAuthentication,
          args: [action.payload]
        })
      )
    case actions.AUTHENTICATION_FAILED:
      return { ...state, submitting: false, submissionError: true }
    case actions.AUTHENTICATION_COMPLETED:
      return loop(
        {
          ...state,
          submitting: false,
          submissionError: false,
          resentSMS: false,
          authenticationDetails: {
            ...state.authenticationDetails,
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
          successActionCreator: actions.completeSMSResend,
          failActionCreator: actions.failSMSResend,
          args: [state.authenticationDetails.nonce]
        })
      )
    case actions.RESEND_SMS_FAILED:
      return { ...state, resentSMS: false, submissionError: true }
    case actions.RESEND_SMS_COMPLETED:
      return {
        ...state,
        resentSMS: true,
        submissionError: false,
        authenticationDetails: {
          ...state.authenticationDetails,
          nonce: action.payload.nonce
        }
      }
    case actions.VERIFY_CODE:
      const code = action.payload.code
      return loop(
        {
          ...state,
          submitting: true,
          submissionError: false,
          resentSMS: false
        },
        Cmd.run(authApi.verifyCode, {
          successActionCreator: actions.completeVerifyCode,
          failActionCreator: actions.failVerifyCode,
          args: [{ code, nonce: state.authenticationDetails.nonce }]
        })
      )
    case actions.VERIFY_CODE_FAILED:
      return { ...state, submitting: false, submissionError: true }
    case actions.VERIFY_CODE_COMPLETED:
      const redirectURL = `${config.REGISTER_APP_URL}?token=${
        action.payload.token
      }`
      return loop(
        {
          ...state,
          stepSubmitting: false,
          submissionError: false,
          resentSMS: false
        },
        Cmd.run(() => {
          window.location.href = redirectURL
        })
      )

    default:
      return state
  }
}
