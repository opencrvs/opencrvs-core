// Chai is a dependency of vitest, and it pollutes the global object namespace with its own 'should' property.
// This colludes with some strict library types, such as elasticsearch esClient.search() parameter types.
// We could separate the tests from the code, and use a separate tsconfig for them, but this is a simpler fix to the solution.
interface Object {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  should?: any
}
