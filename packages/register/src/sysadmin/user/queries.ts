import gql from 'graphql-tag'

export const SEARCH_USERS = gql`
  query($count: Int, $skip: Int) {
    searchUsers(count: $count, skip: $skip) {
      totalItems
      results {
        id
        name {
          use
          firstNames
          familyName
        }
        role
        type
        status
      }
    }
  }
`
