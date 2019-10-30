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
import { IURLParams } from '@performance/utils/authUtils'
import { IUserDetails } from '@performance/utils/userUtils'
import { ApolloQueryResult } from 'apollo-client'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
export const SET_INITIAL_USER_DETAILS = 'PROFILE/SET_INITIAL_USER_DETAILS'
export const SET_USER_DETAILS = 'PROFILE/SET_USER_DETAILS'
export const CHECK_AUTH = 'PROFILE/CHECK_AUTH'
export const REDIRECT_TO_AUTHENTICATION = 'PROFILE/REDIRECT_TO_AUTHENTICATION'

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

type SetInitialUserDetailsAction = {
  type: typeof SET_INITIAL_USER_DETAILS
  payload: IUserDetails
}

export type Action =
  | { type: typeof CHECK_AUTH; payload: IURLParams }
  | RedirectToAuthenticationAction
  | RouterAction
  | SetUserDetailsAction
  | SetInitialUserDetailsAction

export const checkAuth = (payload: IURLParams): CheckAuthAction => ({
  type: CHECK_AUTH,
  payload
})

export const redirectToAuthentication = (): RedirectToAuthenticationAction => ({
  type: REDIRECT_TO_AUTHENTICATION
})

export const setUserDetails = (
  payload: ApolloQueryResult<GQLQuery>
): SetUserDetailsAction => ({
  type: SET_USER_DETAILS,
  payload
})

export const setInitialUserDetails = (
  payload: IUserDetails
): SetInitialUserDetailsAction => ({
  type: SET_INITIAL_USER_DETAILS,
  payload
})
