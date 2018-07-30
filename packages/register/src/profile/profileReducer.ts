import { LoopReducer, Loop } from 'redux-loop'
import * as actions from './profileActions'
import { loggedIn, getProfile, ITokenProfile } from '../utils/authUtils'

export type ProfileState = {
  authenticated: boolean
  tokenProfile: ITokenProfile | null
}

export const initialState: ProfileState = {
  authenticated: false,
  tokenProfile: null
}

export const profileReducer: LoopReducer<ProfileState, actions.Action> = (
  state: ProfileState = initialState,
  action: actions.Action
): ProfileState | Loop<ProfileState, actions.Action> => {
  switch (action.type) {
    case actions.CHECK_AUTH:
      const validToken = loggedIn(action.payload)
      if (validToken) {
        const tokenProfile = getProfile(validToken)
        return {
          ...state,
          authenticated: true,
          tokenProfile
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
