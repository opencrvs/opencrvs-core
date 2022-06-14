/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { loop, LoopReducer, Cmd, Loop, RunCmd } from 'redux-loop'
import { push } from 'connected-react-router'
import * as actions from '@login/login/actions'
import { authApi, IApplicationConfig } from '@login/utils/authApi'
import * as routes from '@login/navigation/routes'
import { merge } from 'lodash'
import { IStoreState } from '@login/store'

export type LoginState = {
  submitting: boolean
  token: string
  authenticationDetails: { nonce: string; mobile: string }
  submissionError: boolean
  resentSMS: boolean
  stepOneDetails: { username: string }
  config: Partial<IApplicationConfig>
  errorCode?: number
}

export const initialState: LoginState = {
  submitting: false,
  token: '',
  config: {},
  authenticationDetails: {
    nonce: '',
    mobile: ''
  },
  submissionError: false,
  resentSMS: false,
  stepOneDetails: { username: '' }
}

const CONFIG_CMD = Cmd.run<
  actions.ApplicationConfigFailed,
  actions.ApplicationConfigLoaded
>(authApi.getApplicationConfig, {
  successActionCreator: actions.applicationConfigLoadedAction,
  failActionCreator: actions.applicationConfigFailedAction
})
const RETRY_TIMEOUT = 5000
function delay(cmd: RunCmd<any>, time: number) {
  return Cmd.list(
    [Cmd.run(() => new Promise((resolve) => setTimeout(resolve, time))), cmd],
    { sequence: true }
  )
}

export const loginReducer: LoopReducer<LoginState, actions.Action> = (
  state: LoginState = initialState,
  action: actions.Action
): LoginState | Loop<LoginState, actions.Action> => {
  switch (action.type) {
    case actions.CONFIG_LOAD:
      return loop(state, CONFIG_CMD)
    case actions.CONFIG_LOADED:
      return loop(
        { ...state, config: action.payload },
        Cmd.run(() => merge(window.config, action.payload))
      )
    case actions.CONFIG_LOAD_ERROR:
      return loop(state, delay(CONFIG_CMD, RETRY_TIMEOUT))
    case actions.AUTHENTICATE:
      return loop(
        {
          ...state,
          submitting: true,
          submissionError: false,
          resentSMS: false,
          stepOneDetails: action.payload
        },
        Cmd.run<
          actions.AuthenticationFailedAction,
          actions.AuthenticateResponseAction
        >(authApi.authenticate, {
          successActionCreator: actions.completeAuthentication,
          failActionCreator: actions.failAuthentication,
          args: [action.payload]
        })
      )
    case actions.AUTHENTICATE_VALIDATE:
      return {
        ...state,
        submissionError: true,
        errorCode: action.payload
      }
    case actions.AUTHENTICATION_FAILED:
      return {
        ...state,
        submitting: false,
        submissionError: true,
        errorCode: action.payload.response && action.payload.response.status
      }
    case actions.AUTHENTICATION_COMPLETED:
      return loop(
        {
          ...state,
          submitting: action.payload.token ? true : false,
          submissionError: false,
          resentSMS: false,
          authenticationDetails: {
            ...state.authenticationDetails,
            nonce: action.payload.nonce,
            mobile: action.payload.mobile
          }
        },
        (action.payload.token &&
          Cmd.run(() => {
            window.location.assign(
              `${window.config.CLIENT_APP_URL}?token=${action.payload.token}`
            )
          })) ||
          Cmd.action(push(routes.STEP_TWO))
      )
    case actions.RESEND_SMS:
      return loop(
        {
          ...state,
          submissionError: false,
          resentSMS: false
        },
        Cmd.run<actions.ResendSMSFailedAction, actions.ResendSMSCompleteAction>(
          authApi.resendSMS,
          {
            successActionCreator: actions.completeSMSResend,
            failActionCreator: actions.failSMSResend,
            args: [state.authenticationDetails.nonce]
          }
        )
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
        Cmd.run<
          actions.VerifyCodeFailedAction,
          actions.VerifyCodeCompleteAction
        >(authApi.verifyCode, {
          successActionCreator: actions.completeVerifyCode,
          failActionCreator: actions.failVerifyCode,
          args: [{ code, nonce: state.authenticationDetails.nonce }]
        })
      )
    case actions.VERIFY_CODE_FAILED:
      return { ...state, submitting: false, submissionError: true }
    case actions.VERIFY_CODE_COMPLETED:
      return loop(
        {
          ...state,
          stepSubmitting: false,
          submissionError: false,
          resentSMS: false,
          token: action.payload.token
        },
        Cmd.run(
          (getState: () => IStoreState) => {
            window.location.assign(
              `${window.config.CLIENT_APP_URL}?token=${
                action.payload.token
              }&language=${getState().i18n.language}`
            )
          },
          { args: [Cmd.getState] }
        )
      )
    case actions.GOTO_APP:
      return loop(
        {
          ...state
        },
        Cmd.run(() => {
          window.location.assign(
            `${window.config.CLIENT_APP_URL}?token=${state.token}`
          )
        })
      )
    default:
      return state
  }
}
