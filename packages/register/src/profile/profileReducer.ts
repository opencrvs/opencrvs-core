import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from './profileActions'
import { storage } from 'src/storage'
import { USER_DETAILS } from 'src/utils/userUtils'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid,
  removeToken
} from '../utils/authUtils'
import {
  IUserDetails,
  getUserDetails,
  storeUserDetails,
  removeUserDetails
} from 'src/utils/userUtils'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { queries } from 'src/profile/queries'

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
        {
          ...state,
          authenticated: false,
          userDetailsFetched: false,
          tokenPayload: null,
          userDetails: null
        },
        Cmd.list([
          Cmd.run(() => {
            removeToken()
          }),
          Cmd.run(() => {
            removeUserDetails()
          }),
          Cmd.run(() => {
            // @ts-ignore
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
      return loop(
        {
          ...state
        },
        Cmd.run<
          | actions.IGetStorageUserDetailsSuccessAction
          | actions.IGetStorageUserDetailsFailedAction
        >(storage.getItem, {
          successActionCreator: actions.getStorageUserDetailsSuccess,
          failActionCreator: actions.getStorageUserDetailsFailed,
          args: [USER_DETAILS]
        })
      )
    case actions.GET_USER_DETAILS_SUCCESS:
      const userDetailsString = action.payload
      const userDetailsCollection = JSON.parse(
        userDetailsString ? userDetailsString : '[]'
      )
      return {
        ...state,
        userDetails: userDetailsCollection
      }
    default:
      return state
  }
}
