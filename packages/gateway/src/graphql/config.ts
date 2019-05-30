import { importSchema } from 'graphql-import'
import { makeExecutableSchema, IResolvers } from 'graphql-tools'

import { resolvers as notificationRootResolvers } from '@gateway/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from '@gateway/features/registration/root-resolvers'
import { resolvers as locationRootResolvers } from '@gateway/features/location/root-resolvers'
import { resolvers as userRootResolvers } from '@gateway/features/user/root-resolvers'
import { resolvers as metricsRootResolvers } from '@gateway/features/metrics/root-resolvers'
import { typeResolvers } from '@gateway/features/registration/type-resovlers'
import { resolvers as searchRootResolvers } from '@gateway/features/search/root-resolvers'
import { searchTypeResolvers } from '@gateway/features/search/type-resovlers'

export const getExecutableSchema = (schemaPath: string) => {
  const typeDefs = importSchema(schemaPath)
  return makeExecutableSchema({
    typeDefs,
    resolvers: [
      // the types we generate out of our schema aren't
      // compatible with the types graphql-tools uses internally.
      notificationRootResolvers as IResolvers,
      registrationRootResolvers as IResolvers,
      locationRootResolvers as IResolvers,
      userRootResolvers as IResolvers,
      metricsRootResolvers as IResolvers,
      typeResolvers as IResolvers,
      searchRootResolvers as IResolvers,
      searchTypeResolvers as IResolvers
    ]
  })
}
