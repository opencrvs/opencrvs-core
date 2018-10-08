import { importSchema } from 'graphql-import'
import { makeExecutableSchema } from 'graphql-tools'

import { resolvers as notificationRootResolvers } from 'src/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from 'src/features/registration/root-resolvers'
import { typeResolvers } from 'src/features/registration/type-resovlers'

export const getExecutableSchema = (schemaPath: string) => {
  const typeDefs = importSchema(schemaPath)
  return makeExecutableSchema({
    typeDefs,
    resolvers: [
      notificationRootResolvers,
      registrationRootResolvers,
      typeResolvers
    ]
  })
}
