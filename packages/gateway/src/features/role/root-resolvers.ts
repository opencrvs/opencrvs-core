import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { IRoleSearchPayload } from '@gateway/features/role/type-resovlers'

export const resolvers: GQLResolver = {
  Query: {
    async getRoles(
      _,
      {
        title = null,
        value = null,
        type = null,
        active = null,
        sortBy = null,
        sortOrder = null
      },
      authHeader
    ) {
      let payload: IRoleSearchPayload = {}
      if (title) {
        payload = { ...payload, title }
      }
      if (value) {
        payload = { ...payload, value }
      }
      if (type) {
        payload = { ...payload, type }
      }
      if (sortBy) {
        payload = { ...payload, sortBy }
      }
      if (sortOrder) {
        payload = { ...payload, sortOrder }
      }
      if (active !== null) {
        payload = { ...payload, active }
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}getRoles`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  }
}
