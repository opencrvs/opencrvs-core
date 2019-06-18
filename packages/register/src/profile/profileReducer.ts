import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@register/profile/profileActions'
import { storage } from '@register/storage'
import {
  USER_DETAILS,
  IUserDetails,
  getUserDetails,
  storeUserDetails,
  removeUserDetails
} from '@register/utils/userUtils'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid,
  removeToken
} from '@register/utils/authUtils'

import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { queries } from '@register/profile/queries'
import * as offlineActions from '@register/offline/actions'
import * as changeLanguageActions from '@register/i18n/actions'

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
  actions.Action | offlineActions.Action | changeLanguageActions.Action
> = (
  state: ProfileState = initialState,
  action: actions.Action | offlineActions.Action | changeLanguageActions.Action
):
  | ProfileState
  | Loop<
      ProfileState,
      actions.Action | offlineActions.Action | changeLanguageActions.Action
    > => {
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
            window.location.assign(window.config.LOGIN_URL)
          })
        ])
      )
    case actions.CHECK_AUTH:
      const token = getToken()

      // Remove token from url if it exists
      if (window.location.search.includes('token=')) {
        window.history.replaceState(null, '', window.location.pathname)
      }

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
      const data: GQLQuery = result && result.data

      if (data && data.getUser) {
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
      } else {
        return {
          ...state,
          userDetailsFetched: false
        }
      }
    case actions.MODIFY_USER_DETAILS:
      const details: IUserDetails = action.payload

      if (details) {
        return loop(
          {
            ...state
          },
          Cmd.list([
            Cmd.run(() => storeUserDetails(details)),
            Cmd.action(
              changeLanguageActions.changeLanguage({
                language: details.language
              })
            )
          ])
        )
      } else {
        return {
          ...state,
          userDetailsFetched: false
        }
      }
    case actions.SET_INITIAL_USER_DETAILS:
      return loop(
        {
          ...state
        },
        Cmd.run<
          actions.IGetStorageUserDetailsFailedAction,
          actions.IGetStorageUserDetailsSuccessAction
        >(storage.getItem, {
          successActionCreator: actions.getStorageUserDetailsSuccess,
          failActionCreator: actions.getStorageUserDetailsFailed,
          args: [USER_DETAILS]
        })
      )
    case actions.GET_USER_DETAILS_SUCCESS:
      const userDetailsString = action.payload
      const userDetailsCollection = JSON.parse(
        userDetailsString ? userDetailsString : 'null'
      )

      // if the user detail cannot be found or they don't match the user specified in the token
      if (
        state.tokenPayload &&
        (!userDetailsCollection ||
          userDetailsCollection.userMgntUserID !== state.tokenPayload.sub)
      ) {
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
