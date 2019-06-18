import { GQLResolver } from '@gateway/graphql/schema'

interface IRoleModelData {
  _id: string
  title: string
  value: string
  types: string[]
  active: boolean
}

export interface IRoleSearchPayload {
  title?: string
  value?: string
  type?: string
  active?: boolean
  sortBy?: string
  sortOrder?: string
}
export const roleTypeResolvers: GQLResolver = {
  Role: {
    id(roleModel: IRoleModelData) {
      return roleModel._id
    }
  }
}
