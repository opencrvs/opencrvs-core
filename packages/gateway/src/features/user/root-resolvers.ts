import {
  GQLResolver,
  GQLUserInput,
  GQLHumanNameInput,
  GQLUserIdentifierInput
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import {
  IUserSearchPayload,
  IUserPayload
} from '@gateway/features/user/type-resovlers'

export const resolvers: GQLResolver = {
  Query: {
    async getUser(_, { userId }, authHeader) {
      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    },

    async searchUsers(
      _,
      {
        username = null,
        mobile = null,
        role = null,
        status = null,
        primaryOfficeId = null,
        locationId = null,
        count = 10,
        skip = 0,
        sort = 'desc'
      },
      authHeader
    ) {
      let payload: IUserSearchPayload = {
        count,
        skip,
        sortOrder: sort
      }
      if (username) {
        payload = { ...payload, username }
      }
      if (mobile) {
        payload = { ...payload, mobile }
      }
      if (role) {
        payload = { ...payload, role }
      }
      if (locationId) {
        payload = { ...payload, locationId }
      }
      if (primaryOfficeId) {
        payload = { ...payload, primaryOfficeId }
      }
      if (status) {
        payload = { ...payload, status }
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  },

  Mutation: {
    async createUser(_, { user }, authHeader) {
      const res = await fetch(`${USER_MANAGEMENT_URL}createUser`, {
        method: 'POST',
        body: JSON.stringify(createUserPayload(user)),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't create user"
          )
        )
      }
      return await res.json()
    },
    async activateUser(_, { userId, password, securityQNAs }, authHeader) {
      const res = await fetch(`${USER_MANAGEMENT_URL}activateUser`, {
        method: 'POST',
        body: JSON.stringify({ userId, password, securityQNAs }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      const response = await res.json()
      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            "Something went wrong on user-mgnt service. Couldn't activate given user"
          )
        )
      }
      return response
    }
  }
}

function createUserPayload(user: GQLUserInput): IUserPayload {
  return {
    name: (user.name as GQLHumanNameInput[]).map((name: GQLHumanNameInput) => ({
      use: name.use as string,
      family: name.familyName as string,
      given: (name.firstNames || '').split(' ') as string[]
    })),
    role: user.role as string,
    type: user.type as string,
    identifiers: (user.identifier as GQLUserIdentifierInput[]) || [],
    primaryOfficeId: user.primaryOffice as string,
    email: user.email || '',
    mobile: user.mobile as string,
    signature: user.signature
  }
}
