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
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  USER_DETAILS,
  IUserDetails,
  getUserDetails,
  storeUserDetails,
  removeUserDetails
} from '@client/utils/userUtils'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid,
  removeToken
} from '@client/utils/authUtils'

import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { queries } from '@client/profile/queries'
import * as changeLanguageActions from '@client/i18n/actions'
import { EMPTY_STRING } from '@client/utils/constants'
import { serviceApi } from '@client/profile/serviceApi'

export type ProfileState = {
  authenticated: boolean
  tokenPayload: ITokenPayload | null
  userDetailsFetched: boolean
  userDetails: IUserDetails | null
  nonce: string
}

export const initialState: ProfileState = {
  authenticated: false,
  userDetailsFetched: false,
  tokenPayload: null,
  userDetails: null,
  nonce: EMPTY_STRING
}

export const profileReducer: LoopReducer<
  ProfileState,
  actions.Action | changeLanguageActions.Action
> = (
  state: ProfileState = initialState,
  action: actions.Action | changeLanguageActions.Action
):
  | ProfileState
  | Loop<ProfileState, actions.Action | changeLanguageActions.Action> => {
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
            Cmd.action(actions.userDetailsAvailable(userDetails))
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
      const userDetailsCollection: IUserDetails | null = JSON.parse(
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
          Cmd.action(actions.userDetailsAvailable(userDetailsCollection!))
        )
      }
    case actions.SEND_VERIFY_CODE:
      const sendVerifyCodeDetails = action.payload
      if (state.tokenPayload && sendVerifyCodeDetails) {
        return loop(
          {
            ...state
          },
          Cmd.run(serviceApi.sendVerifyCode, {
            successActionCreator: actions.SendVerifyCodeSuccess,
            args: [action.payload]
          })
        )
      }
      return state
    case actions.SEND_VERIFY_CODE_COMPLETED:
      const successPayload = action.payload
      if (
        state.tokenPayload &&
        (!successPayload || successPayload.userId === state.tokenPayload.sub)
      ) {
        return { ...state, nonce: successPayload.nonce }
      }
      return state

    default:
      return state
  }
}
