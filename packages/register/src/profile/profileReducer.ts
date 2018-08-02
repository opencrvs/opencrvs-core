import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './profileActions'
import { getTokenPayload, ITokenPayload } from '../utils/authUtils'

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
