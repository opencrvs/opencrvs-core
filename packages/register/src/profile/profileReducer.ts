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
import { config } from '../config'
import {
  IUserDetails,
  getUserDetails,
  storeUserDetails,
  removeUserDetails
} from 'src/utils/userUtils'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { queries } from 'src/profile/queries'
import * as offlineActions from 'src/offline/actions'

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

export const profileReducer: LoopReducer<
  ProfileState,
  actions.Action | offlineActions.Action
> = (
  state: ProfileState = initialState,
  action: actions.Action | offlineActions.Action
):
  | ProfileState
  | Loop<ProfileState, actions.Action | offlineActions.Action> => {
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
            window.location.assign(config.LOGIN_URL)
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
          Cmd.action(actions.setInitialUserDetails())
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
        Cmd.list([
          Cmd.run(() => storeUserDetails(userDetails)),
          Cmd.action(offlineActions.setOfflineData(userDetails))
        ])
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
      if (userDetailsCollection.length === 0 && state.tokenPayload) {
        return loop(
          {
            ...state,
            userDetails: userDetailsCollection
          },
          Cmd.run(queries.fetchUserDetails, {
            successActionCreator: actions.setUserDetails,
            args: [state.tokenPayload.sub]
          })
        )
      } else {
        return loop(
          {
            ...state,
            userDetails: userDetailsCollection
          },
          Cmd.action(offlineActions.setOfflineData(userDetailsCollection))
        )
      }

    default:
      return state
  }
}
