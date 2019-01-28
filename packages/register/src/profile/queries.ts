import gql from 'graphql-tag'
import { client } from 'src/utils/apolloClient'

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

export const FETCH_USER_RECORDS = gql`
  query list($userId: String) {
    listUserRecentRecords(userId: $userId) {
      id
      registration {
        trackingId
        registrationNumber
        status {
          user {
            name {
              use
              firstNames
              familyName
            }
            role
          }
          location {
            name
            alias
          }
          type
          timestamp
        }
      }
      child {
        name {
          use
          firstNames
          familyName
        }
        birthDate
      }
      createdAt
    }
  }
`
async function fetchUserDetails(userId: string) {
  return client.query({
    query: FETCH_USER,
    variables: { userId }
  })
}

async function fetchUserRecords(userId: string) {
  return client.query({
    query: FETCH_USER_RECORDS,
    variables: { userId }
  })
}

export const queries = {
  fetchUserDetails,
  fetchUserRecords
}
