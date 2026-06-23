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
  storeToken,
  getToken,
  isTokenStillValid,
  removeToken,
  getRefreshToken,
  storeRefreshToken
} from '@client/utils/authUtils'
import { queries } from '@client/profile/queries'
import * as changeLanguageActions from '@client/i18n/actions'
import { EMPTY_STRING } from '@client/utils/constants'
import { IStoreState } from '@client/store'
import { ITokenPayload, User } from '@opencrvs/commons/client'

export type ProfileState = {
  authenticated: boolean
  tokenPayload: ITokenPayload | null
  userDetailsFetched: boolean
  userDetails: User | null
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
        Cmd.list(
          [
            Cmd.run(() => removeToken()),
            Cmd.run(() => removeUserDetails()),
            Cmd.run(
              (getState: () => IStoreState) => {
                if (shouldRedirectBack) {
                  const redirectUrl = window.location.pathname
                  const params =
                    redirectUrl === '/'
                      ? `?lang=${getState().i18n.language}`
                      : `?lang=${getState().i18n.language}&redirectTo=${redirectUrl}`
                  window.location.assign(`/login${params}`)
                } else {
                  window.location.assign(
                    `/login?lang=${getState().i18n.language}`
                  )
                }
              },
              { args: [Cmd.getState] }
            )
          ],
          { sequence: true }
        )
      )
    case actions.CHECK_AUTH:
      const token = getToken()
      const refreshToken = getRefreshToken()

      // Remove token params from the url if present
      if (
        window.location.search.includes('token=') ||
        window.location.search.includes('refreshToken=')
      ) {
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
              if (refreshToken) {
                storeRefreshToken(refreshToken)
              }
            }
          }),
          Cmd.action(actions.setInitialUserDetails())
        ])
      )
    case actions.SET_USER_DETAILS:
      const userDetails = action.payload
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
      // if the user detail cannot be found or they don't match the user specified in the token or the user has deprecated systemRole
      if (
        state.tokenPayload &&
        (!userDetailsCollection ||
          'systemRole' in userDetailsCollection ||
          userDetailsCollection.id !== state.tokenPayload.sub)
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
        const immediateCmd = Cmd.action(
          actions.userDetailsAvailable(userDetailsCollection!)
        )
        // Use the cached value immediately so offline data loading is not delayed,
        // but also re-fetch from the server so stale fields (e.g. primaryOfficeId
        // changed by an admin) are corrected without requiring a re-login.
        return loop(
          {
            ...state,
            userDetails: userDetailsCollection
          },
          state.tokenPayload
            ? Cmd.list([
                immediateCmd,
                Cmd.run(queries.fetchUserDetails, {
                  successActionCreator: actions.setUserDetails,
                  args: [state.tokenPayload.sub]
                })
              ])
            : immediateCmd
        )
      }

    default:
      return state
  }
}
