import { RouterAction } from 'react-router-redux'

export const CHECK_AUTH = 'PROFILE/CHECK_AUTH'

export type Action = { type: typeof CHECK_AUTH } | RouterAction

export const checkAuth = (): Action => ({
  type: CHECK_AUTH
})
