/* istanbul ignore file */
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import { readFileSync } from 'fs'

const graphQLSchemaPath = `${process.cwd()}/src/tests/schema.graphql`
const schemaString = readFileSync(graphQLSchemaPath).toString()

export function getSchema() {
  const schema = makeExecutableSchema({
    typeDefs: schemaString
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
