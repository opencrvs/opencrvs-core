import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from './actions'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid
} from '../utils/authUtils'
import { config } from '../config'

export type ProfileState = {
  authenticated: boolean
  tokenPayload: ITokenPayload | null
}

export const initialState: ProfileState = {
  authenticated: false,
  tokenPayload: null
}

export const profileReducer: LoopReducer<ProfileState, actions.Action> = (
  state: ProfileState = initialState,
  action: actions.Action
): ProfileState | Loop<ProfileState, actions.Action> => {
  switch (action.type) {
    case actions.REDIRECT_TO_AUTHENTICATION:
      return loop(
        state,
        Cmd.run(() => {
          window.location.assign(config.LOGIN_URL)
        })
      )
    case actions.CHECK_AUTH:
      const token = getToken() as string
      const payload = getTokenPayload(token)

      if (!payload) {
        return loop(
          {
            ...state,
            authenticated: false
          },
          Cmd.action(actions.redirectToAuthentication())
        )
      }

      return loop(
        {
          ...state,
          authenticated: true,
          tokenPayload: payload
        },
        Cmd.run(() => {
          if (isTokenStillValid(payload)) {
            storeToken(token)
          }
        })
      )

    default:
      return state
  }
}
