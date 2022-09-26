import { GQLResolver } from '@gateway/graphql/schema'

export const typeResolvers: GQLResolver = {
  UserAuditLogResultItem: {
    __resolveType(obj) {
      if (obj.data?.compositionId) {
        return 'UserAuditLogItemWithComposition'
      } else {
        return 'UserAuditLogItem'
      }
    }
  }
}
