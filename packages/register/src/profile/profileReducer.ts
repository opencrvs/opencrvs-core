import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from './profileActions'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid
} from '../utils/authUtils'
import { config } from '../config'
import {
  IUserDetails,
  getUserDetails,
  storeUserDetails
} from '@opencrvs/register/src/utils/userUtils'
import { GQLUser } from '@opencrvs/gateway/src/graphql/schema'

export type ProfileState = {
  authenticated: boolean
  tokenPayload: ITokenPayload | null
  userDetailsFetched: boolean
  userDetails: IUserDetails | null
}

export const initialState: ProfileState = {
  authenticated: false,
  userDetailsFetched: false,
  tokenPayload: null,
  userDetails: null
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
      const token = getToken()
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
    case actions.SET_USER_DETAILS:
      const user: GQLUser = action.payload
      const userDetails = getUserDetails(user)
      return loop(
        {
          ...state,
          userDetailsFetched: true,
          userDetails
        },
        Cmd.run(() => storeUserDetails(userDetails))
      )
    default:
      return state
  }
}
