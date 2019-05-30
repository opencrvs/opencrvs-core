import { importSchema } from 'graphql-import'
import { makeExecutableSchema, IResolvers } from 'graphql-tools'

import { resolvers as notificationRootResolvers } from 'src/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from 'src/features/registration/root-resolvers'
import { resolvers as locationRootResolvers } from 'src/features/location/root-resolvers'
import { resolvers as userRootResolvers } from 'src/features/user/root-resolvers'
import { resolvers as metricsRootResolvers } from 'src/features/metrics/root-resolvers'
import { typeResolvers } from 'src/features/registration/type-resovlers'
import { resolvers as searchRootResolvers } from 'src/features/search/root-resolvers'
import { searchTypeResolvers } from 'src/features/search/type-resovlers'
import { userTypeResolvers } from 'src/features/user/type-resovlers'

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
      userTypeResolvers as IResolvers,
      metricsRootResolvers as IResolvers,
      typeResolvers as IResolvers,
      searchRootResolvers as IResolvers,
      searchTypeResolvers as IResolvers
    ]
  })
}
