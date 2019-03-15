import { importSchema } from 'graphql-import'

test('should import schema with no errors', () => {
  expect(() => importSchema(`${__dirname}/index.graphql`)).not.toThrow()
})
