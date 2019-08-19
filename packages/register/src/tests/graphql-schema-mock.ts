import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import { readFileSync } from 'fs'

const graphQLSchemaPath = `${process.cwd()}/src/tests/schema.graphql`
const schemaString = readFileSync(graphQLSchemaPath).toString()

export function getSchema() {
  const schema = makeExecutableSchema({
    typeDefs: schemaString,
    /*
     * This disables the following warnings:
     *
     * Type "EventSearchSet" is missing a "resolveType" resolver.
     * Pass false into "resolverValidationOptions.requireResolversForResolveType" to disable this warning.
     */
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  })

  addMockFunctionsToSchema({
    schema,
    mocks: {
      Date: () => {
        return new Date()
      }
    }
  })

  return schema
}
