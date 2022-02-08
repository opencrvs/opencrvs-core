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

import { RouterAction } from 'connected-react-router'
import { IURLParams } from '@client/utils/authUtils'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { ApolloQueryResult } from 'apollo-client'
import { IUserDetails } from '@client/utils/userUtils'
export const CHECK_AUTH = 'PROFILE/CHECK_AUTH' as const
export const REDIRECT_TO_AUTHENTICATION =
  'PROFILE/REDIRECT_TO_AUTHENTICATION' as const
export const FETCH_USER_DETAILS = 'PROFILE/FETCH_USER_DETAILS' as const
export const SET_USER_DETAILS = 'PROFILE/SET_USER_DETAILS' as const
export const MODIFY_USER_DETAILS = 'PROFILE/MODIFY_USER_DETAILS' as const
export const SET_INITIAL_USER_DETAILS =
  'PROFILE/SET_INITIAL_USER_DETAILS' as const
export const GET_USER_DETAILS_SUCCESS =
  'PROFILE/GET_USER_DETAILS_SUCCESS' as const
export const GET_USER_DETAILS_FAILED =
  'PROFILE/GET_USER_DETAILS_FAILED' as const
export const USER_DETAILS_AVAILABLE = 'PROFILE/USER_DETAILS_AVAILABLE' as const
export const SEND_VERIFY_CODE = 'PROFILE/SEND_VERIFY_CODE' as const
export const SEND_VERIFY_CODE_COMPLETED =
  'PROFILE/SEND_VERIFY_CODE_COMPLETED' as const

type RedirectToAuthenticationAction = {
  type: typeof REDIRECT_TO_AUTHENTICATION
}

type CheckAuthAction = {
  type: typeof CHECK_AUTH
  payload: IURLParams
}

type SetUserDetailsAction = {
  type: typeof SET_USER_DETAILS
  payload: ApolloQueryResult<GQLQuery>
}

type ModifyUserDetailsAction = {
  type: typeof MODIFY_USER_DETAILS
  payload: IUserDetails
}
type SendVerifyCode = {
  type: typeof SEND_VERIFY_CODE
  payload: {
    phoneNumber: string
  }
}

type SendVerifyCodeSuccessAction = {
  type: typeof SEND_VERIFY_CODE_COMPLETED
  payload: {
    userId: string
    nonce: string
    mobile: string
    status: string
  }
}

export type IGetStorageUserDetailsSuccessAction = {
  type: typeof GET_USER_DETAILS_SUCCESS
  payload: string
}

export type IGetStorageUserDetailsFailedAction = {
  type: typeof GET_USER_DETAILS_FAILED
}

export type ISetInitialUserDetails = {
  type: typeof SET_INITIAL_USER_DETAILS
}

export const checkAuth = (payload: IURLParams): CheckAuthAction => ({
  type: CHECK_AUTH,
  payload
})

export const setUserDetails = (
  payload: ApolloQueryResult<GQLQuery>
): SetUserDetailsAction => ({
  type: SET_USER_DETAILS,
  payload
})
export const userDetailsAvailable = (payload: IUserDetails) => ({
  type: USER_DETAILS_AVAILABLE,
  payload
})

export type UserDetailsAvailable = ReturnType<typeof userDetailsAvailable>

export const modifyUserDetails = (
  payload: IUserDetails
): ModifyUserDetailsAction => ({
  type: MODIFY_USER_DETAILS,
  payload
})

export const setInitialUserDetails = (): ISetInitialUserDetails => ({
  type: SET_INITIAL_USER_DETAILS
})

export const getStorageUserDetailsSuccess = (
  response: string
): IGetStorageUserDetailsSuccessAction => {
  return {
    type: GET_USER_DETAILS_SUCCESS,
    payload: response
  }
}

export const getStorageUserDetailsFailed =
  (): IGetStorageUserDetailsFailedAction => ({
    type: GET_USER_DETAILS_FAILED
  })

export const redirectToAuthentication = (): RedirectToAuthenticationAction => ({
  type: REDIRECT_TO_AUTHENTICATION
})

export const sendVerifyCode = (phoneNumber: string): SendVerifyCode => {
  return {
    type: SEND_VERIFY_CODE,
    payload: {
      phoneNumber
    }
  }
}

export const SendVerifyCodeSuccess = (payload: {
  userId: string
  nonce: string
  mobile: string
  status: string
}): SendVerifyCodeSuccessAction => {
  return {
    type: SEND_VERIFY_CODE_COMPLETED,
    payload
  }
}

export type Action =
  | CheckAuthAction
  | SetUserDetailsAction
  | RedirectToAuthenticationAction
  | RouterAction
  | ISetInitialUserDetails
  | IGetStorageUserDetailsSuccessAction
  | IGetStorageUserDetailsFailedAction
  | ModifyUserDetailsAction
  | UserDetailsAvailable
  | SendVerifyCode
  | SendVerifyCodeSuccessAction
