import { importSchema } from 'graphql-import'
import { makeExecutableSchema } from 'graphql-tools'
import { resolvers } from './resolvers'

export const getExecutableSchema = (schemaPath: string) => {
  const typeDefs = importSchema(schemaPath)
  return makeExecutableSchema({
    resolvers,
    typeDefs
  })
}
