import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from './profileActions'
import { getTokenPayload, ITokenPayload } from '../utils/authUtils'
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
      const tokenPayload = getTokenPayload()
      if (tokenPayload) {
        return {
          ...state,
          authenticated: true,
          tokenPayload
        }
      } else {
        return {
          ...state,
          authenticated: false
        }
      }

    default:
      return state
  }
}
