import { RouterAction } from 'react-router-redux'
import { IURLParams } from '../utils/authUtils'

export const CHECK_AUTH = 'PROFILE/CHECK_AUTH'

export type Action =
  | { type: typeof CHECK_AUTH; payload: IURLParams }
  | RouterAction

export const checkAuth = (payload: IURLParams): Action => ({
  type: CHECK_AUTH,
  payload
})
