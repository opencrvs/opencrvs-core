import { RouterAction } from 'react-router-redux'
import { IURLParams } from '../utils/authUtils'
import { GQLUser } from '@opencrvs/gateway/src/graphql/schema.d'
export const CHECK_AUTH = 'PROFILE/CHECK_AUTH'
export const REDIRECT_TO_AUTHENTICATION = 'PROFILE/REDIRECT_TO_AUTHENTICATION'
export const SET_USER_DETAILS = 'PROFILE/SET_USER_DETAILS'

type RedirectToAuthenticationAction = {
  type: typeof REDIRECT_TO_AUTHENTICATION
}

type CheckAuthAction = {
  type: typeof CHECK_AUTH
  payload: IURLParams
}

type SetUserDetailsAction = {
  type: typeof SET_USER_DETAILS
  payload: GQLUser
}

export type Action =
  | { type: typeof CHECK_AUTH; payload: IURLParams }
  | { type: typeof SET_USER_DETAILS; payload: GQLUser }
  | RedirectToAuthenticationAction
  | RouterAction

export const checkAuth = (payload: IURLParams): CheckAuthAction => ({
  type: CHECK_AUTH,
  payload
})

export const setUserDetails = (payload: GQLUser): SetUserDetailsAction => ({
  type: SET_USER_DETAILS,
  payload
})

export const redirectToAuthentication = (): RedirectToAuthenticationAction => ({
  type: REDIRECT_TO_AUTHENTICATION
})
