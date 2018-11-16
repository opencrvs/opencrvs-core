import { importSchema } from 'graphql-import'
import { makeExecutableSchema, IResolvers } from 'graphql-tools'

import { resolvers as notificationRootResolvers } from 'src/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from 'src/features/registration/root-resolvers'
import { resolvers as locationRootResolvers } from 'src/features/location/root-resolvers'
import { typeResolvers } from 'src/features/registration/type-resovlers'

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
      typeResolvers as IResolvers
    ]
  })
}
