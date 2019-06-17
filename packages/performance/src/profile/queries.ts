import gql from 'graphql-tag'
import { client } from '@performance/utils/apolloClient'

const FETCH_USER = gql`
  query($userId: String!) {
    getUser(userId: $userId) {
      role
      name {
        use
        firstNames
        familyName
      }
      catchmentArea {
        id
        name
        status
        identifier {
          system
          value
        }
      }
      primaryOffice {
        id
        name
        status
      }
    }
  }
`
async function fetchUserDetails(userId: string) {
  return client.query({
    query: FETCH_USER,
    variables: { userId }
  })
}

export const queries = {
  fetchUserDetails
}
