import { RouterAction } from 'react-router-redux'
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
