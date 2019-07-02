import gql from 'graphql-tag'

export const getRolesQuery = gql`
  query roles {
    getRoles(active: true) {
      value
      types
    }
  }
`
