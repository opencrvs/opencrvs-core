/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from '@client/profile/profileActions'
import { storage } from '@client/storage'
import {
  USER_DETAILS,
  storeUserDetails,
  removeUserDetails,
  UserDetails
} from '@client/utils/userUtils'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid,
  removeToken
} from '@client/utils/authUtils'
import { queries } from '@client/profile/queries'
import * as changeLanguageActions from '@client/i18n/actions'
import { EMPTY_STRING } from '@client/utils/constants'
import { serviceApi } from '@client/profile/serviceApi'
import { IStoreState } from '@client/store'

export type ProfileState = {
  authenticated: boolean
  tokenPayload: ITokenPayload | null
  userDetailsFetched: boolean
  userDetails: UserDetails | null
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
      const shouldRedirectBack = action.payload.redirectBack
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
          Cmd.run(
            (getState: () => IStoreState) => {
              if (shouldRedirectBack) {
                const baseUrl = window.location.origin
                const restUrl = window.location.href.replace(baseUrl, '')
                const redirectToURL = new URL(
                  restUrl === '/'
                    ? `?lang=${getState().i18n.language}`
                    : `?lang=${getState().i18n.language}&redirectTo=${restUrl}`,
                  window.config.LOGIN_URL
                ).toString()

                window.location.assign(redirectToURL)
              } else {
                window.location.assign(
                  `${window.config.LOGIN_URL}?lang=${getState().i18n.language}`
                )
              }
            },
            { args: [Cmd.getState] }
          )
        ])
      )
    case actions.CHECK_AUTH:
      const token = getToken()

      // Remove token and language from url if these exists
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
          Cmd.action(actions.redirectToAuthentication(true))
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
      const result = action.payload
      const data = result && result.data

      if (data && data.getUser) {
        const userDetails = data.getUser

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
      const modifiedDetails = action.payload
      if (state.userDetails) {
        return loop(
          {
            ...state,
            userDetails: { ...state.userDetails, ...modifiedDetails }
          },
          Cmd.run(storeUserDetails, {
            args: [{ ...state.userDetails, ...modifiedDetails }]
          })
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
      const userDetailsCollection: UserDetails | null = JSON.parse(
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
      const { notificationEvent, phoneNumber, email } = action.payload
      if (state.tokenPayload && notificationEvent && (phoneNumber || email)) {
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
