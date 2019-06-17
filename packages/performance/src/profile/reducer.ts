import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@performance/profile/actions'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid,
  removeToken
} from '@performance/utils/authUtils'
import {
  IUserDetails,
  getUserDetails,
  storeUserDetails
} from '@performance/utils/userUtils'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { queries } from '@performance/profile/queries'

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
        Cmd.list([
          Cmd.run(() => {
            removeToken()
          }),
          Cmd.run(() => {
            window.location.assign(window.config.LOGIN_URL)
          })
        ])
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
        Cmd.list([
          Cmd.run(() => {
            if (isTokenStillValid(payload)) {
              storeToken(token)
            }
          }),
          Cmd.run(queries.fetchUserDetails, {
            successActionCreator: actions.setUserDetails,
            args: [payload.sub]
          })
        ])
      )
    case actions.SET_USER_DETAILS:
      const result: ApolloQueryResult<GQLQuery> = action.payload
      const data: GQLQuery = result.data
      if (!data.getUser) {
        return {
          ...state,
          userDetailsFetched: false
        }
      }

      const userDetails = getUserDetails(data.getUser)
      return loop(
        {
          ...state,
          userDetailsFetched: true,
          userDetails
        },
        Cmd.run(() => storeUserDetails(userDetails))
      )
    case actions.SET_INITIAL_USER_DETAILS:
      return {
        ...state,
        userDetails: action.payload
      }

    default:
      return state
  }
}
