import { LoopReducer, Loop, loop, Cmd } from 'redux-loop'
import * as actions from './profileActions'
import {
  getTokenPayload,
  ITokenPayload,
  storeToken,
  getToken,
  isTokenStillValid
} from '../utils/authUtils'
import { config } from '../config'
import {
  IUserDetails,
  getUserDetails,
  storeUserDetails
} from '@opencrvs/register/src/utils/userUtils'
import { GQLQuery } from '@opencrvs/gateway/src/graphql/schema.d'
import { client } from 'src/utils/apolloClient'
import gql from 'graphql-tag'
import { ApolloQueryResult } from 'apollo-client'

export type ProfileState = {
  authenticated: boolean
  tokenPayload: ITokenPayload | null
  userDetailsFetched: boolean
  userDetails: IUserDetails | null
}

export const initialState: ProfileState = {
  authenticated: false,
  userDetailsFetched: false,
  tokenPayload: null,
  userDetails: null
}

const FETCH_USER = gql`
  query($userId: String!) {
    getUser(userId: $userId) {
      catchmentArea {
        id
        name
        status
      }
      primaryOffice {
        id
        name
        status
      }
    }
  }
`
async function fetchUserDetails(userId: string) {
  return await client.query({
    query: FETCH_USER,
    variables: { userId }
  })
}
export const profileReducer: LoopReducer<ProfileState, actions.Action> = (
  state: ProfileState = initialState,
  action: actions.Action
): ProfileState | Loop<ProfileState, actions.Action> => {
  switch (action.type) {
    case actions.REDIRECT_TO_AUTHENTICATION:
      return loop(
        state,
        Cmd.run(() => {
          window.location.assign(config.LOGIN_URL)
        })
      )
    case actions.CHECK_AUTH:
      const token = getToken()
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
          Cmd.run(fetchUserDetails, {
            successActionCreator: actions.setUserDetails,
            args: [payload.sub]
          })
        ])
      )
    case actions.SET_USER_DETAILS:
      const result: ApolloQueryResult<GQLQuery> = action.payload
      const data: GQLQuery = result.data
      if (!data.getUser) {
        return {
          ...state,
          userDetailsFetched: false
        }
      }

      const userDetails = getUserDetails(data.getUser)
      return loop(
        {
          ...state,
          userDetailsFetched: true,
          userDetails
        },
        Cmd.run(() => storeUserDetails(userDetails))
      )
    default:
      return state
  }
}
