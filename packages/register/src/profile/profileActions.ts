import { RouterAction } from 'react-router-redux'
import { IURLParams } from '../utils/authUtils'

export const CHECK_AUTH = 'PROFILE/CHECK_AUTH'
export const REDIRECT_TO_AUTHENTICATION = 'PROFILE/REDIRECT_TO_AUTHENTICATION'

type RedirectToAuthenticationAction = {
  type: typeof REDIRECT_TO_AUTHENTICATION
}

export type Action =
  | { type: typeof CHECK_AUTH; payload: IURLParams }
  | RedirectToAuthenticationAction
  | RouterAction

export const checkAuth = (payload: IURLParams): Action => ({
  type: CHECK_AUTH,
  payload
})

export const redirectToAuthentication = (): RedirectToAuthenticationAction => ({
  type: REDIRECT_TO_AUTHENTICATION
})
